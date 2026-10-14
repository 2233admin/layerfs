-- Disposable overlay schema; its version is the user_version at the end.
-- One database holds one Workspace; runtime custody is in the engine.
CREATE TABLE fs_inode (
    inode INTEGER NOT NULL CHECK(inode>0),
    generation INTEGER NOT NULL CHECK(generation=-1 OR generation>0),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 3),
    mode INTEGER NOT NULL CHECK(mode>=0 AND ((kind=1 AND mode<=511) OR (kind=2 AND mode<=1023) OR (kind=3 AND mode=511))),
    mtime_seconds INTEGER NOT NULL,
    mtime_nanoseconds INTEGER NOT NULL CHECK(mtime_nanoseconds>=0 AND mtime_nanoseconds<1000000000),
    nlink INTEGER NOT NULL CHECK(nlink>=0),
    size INTEGER NOT NULL CHECK(size>=0),
    inherited_cutoff INTEGER NOT NULL CHECK(inherited_cutoff>=0),
    born INTEGER NOT NULL CHECK(born>=0 AND (generation=-1 OR born<=generation)),
    entries INTEGER NOT NULL CHECK(entries>=0 AND (kind=2 OR entries=0)),
    subdirs INTEGER NOT NULL CHECK(subdirs>=0 AND (kind=2 OR subdirs=0)),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    height INTEGER NOT NULL CHECK(height>=0 AND height<=epoch),
    -- Whether this layer of the file has ever held a reference piece.
    referenced INTEGER NOT NULL DEFAULT 0 CHECK(referenced IN(0,1)),
    -- Content sequence: the Workspace revision that last wrote this row.
    sequence INTEGER NOT NULL DEFAULT 0 CHECK(sequence>=0),
    PRIMARY KEY(inode,generation)
) STRICT, WITHOUT ROWID;
CREATE INDEX fs_inode_capture ON fs_inode(generation,inode);
CREATE TABLE fs_entry (
    parent INTEGER NOT NULL CHECK(parent>0),
    name BLOB NOT NULL CHECK(length(name)>0 AND length(name)<=255),
    generation INTEGER NOT NULL CHECK(generation>0),
    inode INTEGER CHECK(inode>0),
    inherited INTEGER NOT NULL CHECK(inherited IN(0,1)),
    PRIMARY KEY(parent,name,generation)
) STRICT, WITHOUT ROWID;
CREATE INDEX fs_entry_capture ON fs_entry(generation,parent,name);
CREATE TABLE fs_data (
    rowid INTEGER PRIMARY KEY,
    inode INTEGER NOT NULL CHECK(inode>0),
    generation INTEGER NOT NULL CHECK(generation=-1 OR generation>0),
    cell_offset INTEGER NOT NULL CHECK(cell_offset>=0 AND cell_offset%4096=0),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    -- One cell at most, or a dense run of whole cells inside one aligned 32768-byte slot.
    data BLOB NOT NULL CHECK(length(data) BETWEEN 1 AND 32768 AND (length(data)<=4096 OR
        (validity IS NULL AND length(data)%4096=0 AND cell_offset/32768=(cell_offset+length(data)-1)/32768))),
    validity BLOB CHECK(validity IS NULL OR length(validity)=(length(data)+7)/8),
    UNIQUE(inode,generation,cell_offset)
) STRICT;
CREATE TABLE fs_truncate (
    inode INTEGER NOT NULL CHECK(inode>0),
    generation INTEGER NOT NULL CHECK(generation=-1 OR generation>0),
    depth INTEGER NOT NULL CHECK(depth>0),
    cell_offset INTEGER NOT NULL CHECK(cell_offset>=0 AND cell_offset%4096=0),
    epoch INTEGER NOT NULL CHECK(epoch>0),
    PRIMARY KEY(inode,generation,depth)
) STRICT, WITHOUT ROWID;
-- A reference piece: `length` bytes of one layer from `file_offset` are the
-- committed bytes of content root `source` from `source_offset`. It holds no
-- bytes. Pieces of one layer never overlap, live or stale; a piece is stale
-- by its first byte and its stamp, like a fs_data row.
CREATE TABLE fs_data_ref (
    generation INTEGER NOT NULL CHECK(generation=-1 OR generation>0),
    inode INTEGER NOT NULL CHECK(inode>0),
    file_offset INTEGER NOT NULL CHECK(file_offset>=0 AND file_offset%4096=0),
    length INTEGER NOT NULL CHECK(length>0),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    source BLOB NOT NULL CHECK(length(source)=32),
    source_offset INTEGER NOT NULL CHECK(source_offset>=0),
    PRIMARY KEY(generation,inode,file_offset)
) STRICT, WITHOUT ROWID;
CREATE INDEX fs_data_generation ON fs_data(generation,inode,cell_offset);
CREATE INDEX fs_truncate_generation ON fs_truncate(generation,inode,depth);
CREATE TABLE commit_pin (
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 6 OR kind=8),
    holder INTEGER NOT NULL CHECK(holder>0),
    resource INTEGER NOT NULL CHECK(resource>=0),
    PRIMARY KEY(kind,holder,resource)
) STRICT, WITHOUT ROWID;
CREATE TABLE commit_base_pin (
    kind INTEGER NOT NULL DEFAULT 0 CHECK(kind BETWEEN 0 AND 2),
    holder INTEGER NOT NULL CHECK(holder>0),
    base_root BLOB NOT NULL CHECK(length(base_root)=32),
    PRIMARY KEY(kind,holder)
) STRICT, WITHOUT ROWID;

PRAGMA application_id=1279676210;

CREATE INDEX commit_pin_resource ON commit_pin(kind,resource,holder);
CREATE TABLE cleanup_task (
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 12),
    resource INTEGER NOT NULL CHECK(resource>=0),
    target INTEGER NOT NULL CHECK(target<>0),
    phase INTEGER NOT NULL DEFAULT 0 CHECK(phase>=0),
    cursor INTEGER NOT NULL DEFAULT 0 CHECK(cursor>=-1),
    aux INTEGER NOT NULL DEFAULT -1 CHECK(aux>=-1),
    name BLOB NOT NULL DEFAULT X'' CHECK(length(name)<=255),
    ready INTEGER NOT NULL DEFAULT 1 CHECK(ready IN(0,1)),
    PRIMARY KEY(kind,resource,target)
) STRICT, WITHOUT ROWID;
CREATE INDEX cleanup_task_ready ON cleanup_task(ready,kind,resource,target);
CREATE INDEX cleanup_task_generation ON cleanup_task(target,kind,resource);

CREATE TABLE commit_reader (
    request INTEGER NOT NULL CHECK(request>0),
    holder INTEGER NOT NULL CHECK(holder>0),
    generation INTEGER NOT NULL CHECK(generation>0),
    revision INTEGER NOT NULL CHECK(revision>=0),
    base_root BLOB NOT NULL CHECK(length(base_root)=32),
    installed INTEGER NOT NULL CHECK(installed>=0),
    PRIMARY KEY(holder), UNIQUE(request)
) STRICT, WITHOUT ROWID;

CREATE TABLE commit_run (
    request INTEGER NOT NULL CHECK(request>0),
    holder INTEGER NOT NULL CHECK(holder>0),
    PRIMARY KEY(holder), UNIQUE(request)
) STRICT, WITHOUT ROWID;
CREATE TABLE commit_record (
    operation INTEGER NOT NULL CHECK(operation>0),
    file_scope BLOB NOT NULL CHECK(length(file_scope)=8),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 0 AND 4294967295),
    key BLOB NOT NULL CHECK(length(key)=32),
    value BLOB NOT NULL CHECK(length(value)<=65536),
    PRIMARY KEY(operation,file_scope,kind,key)
) STRICT, WITHOUT ROWID;

PRAGMA user_version=36;
