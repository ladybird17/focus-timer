use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "initial schema",
            sql: r#"
CREATE TABLE modes (
    id    INTEGER PRIMARY KEY,
    key   TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
);

CREATE TABLE tags (
    id       INTEGER PRIMARY KEY,
    mode_id  INTEGER NOT NULL REFERENCES modes(id),
    key      TEXT NOT NULL,
    label    TEXT NOT NULL,
    color    TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    UNIQUE(mode_id, key)
);

CREATE TABLE sessions (
    id               INTEGER PRIMARY KEY,
    mode_id          INTEGER NOT NULL REFERENCES modes(id),
    tag_id           INTEGER NOT NULL REFERENCES tags(id),
    planned_min      INTEGER NOT NULL,
    started_at       TEXT NOT NULL,
    ended_at         TEXT,
    status           TEXT NOT NULL,
    interrupt_reason TEXT,
    self_review      TEXT,
    note             TEXT
);

CREATE INDEX idx_sessions_started ON sessions(started_at);
CREATE INDEX idx_sessions_tag     ON sessions(tag_id);
CREATE INDEX idx_sessions_mode    ON sessions(mode_id);
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed modes and tags",
            sql: r#"
INSERT INTO modes (key, label) VALUES ('work', '업무');
INSERT INTO modes (key, label) VALUES ('study', '공부');

INSERT INTO tags (mode_id, key, label, color) VALUES
  ((SELECT id FROM modes WHERE key = 'work'), 'bugfix',      '버그픽스',  '#ef4444'),
  ((SELECT id FROM modes WHERE key = 'work'), 'api',         'API',       '#f97316'),
  ((SELECT id FROM modes WHERE key = 'work'), 'refactoring', '리팩토링',  '#eab308'),
  ((SELECT id FROM modes WHERE key = 'work'), 'meeting',     '회의',      '#22c55e'),
  ((SELECT id FROM modes WHERE key = 'work'), 'deploy',      '배포',      '#06b6d4'),
  ((SELECT id FROM modes WHERE key = 'work'), 'document',    '문서',      '#8b5cf6');

INSERT INTO tags (mode_id, key, label, color) VALUES
  ((SELECT id FROM modes WHERE key = 'study'), 'coding',       '코딩 공부',     '#3b82f6'),
  ((SELECT id FROM modes WHERE key = 'study'), 'reading',      '독서/논문',     '#a855f7'),
  ((SELECT id FROM modes WHERE key = 'study'), 'tutorial',     '튜토리얼',      '#ec4899'),
  ((SELECT id FROM modes WHERE key = 'study'), 'side-project', '개인 프로젝트', '#14b8a6'),
  ((SELECT id FROM modes WHERE key = 'study'), 'review',       '복습',          '#f59e0b'),
  ((SELECT id FROM modes WHERE key = 'study'), 'certificate',  '자격증',        '#10b981'),
  ((SELECT id FROM modes WHERE key = 'study'), 'job-prep',     '이직 준비',     '#6366f1');
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "rename job-prep tag to career",
            sql: r#"
UPDATE tags
SET key = 'career', label = '커리어'
WHERE key = 'job-prep'
  AND mode_id = (SELECT id FROM modes WHERE key = 'study');
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add label_en to tags for user-created tags",
            sql: r#"
ALTER TABLE tags ADD COLUMN label_en TEXT;
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add point_state for focus points",
            // 포인트는 세션 기록과 따로 보관한다 (세션을 지워도 포인트는 남음).
            // carry_min = 아직 1시간을 못 채운 자투리 분, points = 누적 포인트 (집중 1시간마다 5P).
            // 이미 쌓인 세션 기록은 같은 규칙으로 한 번 환산해서 넣는다.
            sql: r#"
CREATE TABLE point_state (
    id        INTEGER PRIMARY KEY CHECK (id = 1),
    carry_min INTEGER NOT NULL DEFAULT 0,
    points    INTEGER NOT NULL DEFAULT 0
);

INSERT INTO point_state (id, carry_min, points)
SELECT 1, total % 60, (total / 60) * 5
FROM (
    SELECT COALESCE(SUM(MAX(0, MIN(planned_min,
        CAST((julianday(ended_at) - julianday(started_at)) * 1440 + 0.01 AS INTEGER)
    ))), 0) AS total
    FROM sessions
    WHERE status IN ('completed', 'interrupted') AND ended_at IS NOT NULL
);
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "new default tags and tag sort order",
            // 기본 태그를 업무(개발·배포·문서·회의) / 공부(코딩·독서/논문·어학·자격증)로 바꾼다.
            // - 예전 기본 태그 중 세션 기록이 하나도 없는 것만 지운다 (기록이 있으면 그대로 둔다).
            // - sort_order 로 기본 태그 순서를 정한다. NULL(직접 만든 태그 등)은 그 뒤에 id 순.
            sql: r#"
ALTER TABLE tags ADD COLUMN sort_order INTEGER;

UPDATE tags SET label = '코딩'
WHERE key = 'coding' AND label = '코딩 공부'
  AND mode_id = (SELECT id FROM modes WHERE key = 'study');

-- 같은 이름의 태그를 이미 직접 만들어 쓰고 있으면 새로 넣지 않는다 (이름이 겹치지 않게)
INSERT OR IGNORE INTO tags (mode_id, key, label, color)
SELECT m.id, 'dev', '개발', '#ef4444' FROM modes m
WHERE m.key = 'work'
  AND NOT EXISTS (SELECT 1 FROM tags t
                  WHERE t.mode_id = m.id AND t.label = '개발' AND t.archived = 0);

INSERT OR IGNORE INTO tags (mode_id, key, label, color)
SELECT m.id, 'language', '어학', '#ec4899' FROM modes m
WHERE m.key = 'study'
  AND NOT EXISTS (SELECT 1 FROM tags t
                  WHERE t.mode_id = m.id AND t.label = '어학' AND t.archived = 0);

DELETE FROM tags
WHERE id NOT IN (SELECT tag_id FROM sessions)
  AND (
    (mode_id = (SELECT id FROM modes WHERE key = 'work')
      AND key IN ('bugfix', 'api', 'refactoring'))
    OR
    (mode_id = (SELECT id FROM modes WHERE key = 'study')
      AND key IN ('tutorial', 'side-project', 'review', 'career'))
  );

UPDATE tags SET sort_order = CASE key
    WHEN 'deploy' THEN 2 WHEN 'document' THEN 3 WHEN 'meeting' THEN 4
  END
WHERE mode_id = (SELECT id FROM modes WHERE key = 'work')
  AND key IN ('deploy', 'document', 'meeting');

UPDATE tags SET sort_order = CASE key
    WHEN 'coding' THEN 1 WHEN 'reading' THEN 2 WHEN 'certificate' THEN 4
  END
WHERE mode_id = (SELECT id FROM modes WHERE key = 'study')
  AND key IN ('coding', 'reading', 'certificate');

-- 개발·어학은 직접 만든 같은 이름의 태그일 수도 있으므로 이름으로도 찾는다
UPDATE tags SET sort_order = 1
WHERE mode_id = (SELECT id FROM modes WHERE key = 'work')
  AND archived = 0 AND (key = 'dev' OR label = '개발');

UPDATE tags SET sort_order = 3
WHERE mode_id = (SELECT id FROM modes WHERE key = 'study')
  AND archived = 0 AND (key = 'language' OR label = '어학');
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "drop point_state (focus points removed)",
            // 포인트 제도를 없앴다. 5번 마이그레이션은 이미 적용된 DB와 맞아야 하므로 그대로 두고 여기서 테이블만 지운다.
            sql: r#"
DROP TABLE IF EXISTS point_state;
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "add stickers (user-registered sticker images)",
            // data = 보관용으로 줄인 이미지의 data URL. 본체에 붙인 위치는 화면 설정이라 localStorage 에 둔다.
            sql: r#"
CREATE TABLE stickers (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    mime       TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"#,
            kind: MigrationKind::Up,
        },
    ]
}
