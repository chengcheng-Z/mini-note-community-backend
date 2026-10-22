CREATE KEYSPACE IF NOT EXISTS xiaohashu
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE IF NOT EXISTS xiaohashu.note_content (
    id uuid PRIMARY KEY,
    content text
);
