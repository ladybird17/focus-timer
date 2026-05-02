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
    ]
}
