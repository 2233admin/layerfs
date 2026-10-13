-- Disposable overlay schema; its version is the user_version at the end.
-- All owner relations lead with Workspace ns.
CREATE TABLE workspace (
    ns INTEGER PRIMARY KEY AUTOINCREMENT,
    incarnation BLOB NOT NULL UNIQUE CHECK(length(incarnation)=32),
    base_root BLOB NOT NULL CHECK(length(base_root)=32),
    active INTEGER NOT NULL CHECK(active>0),
    captured INTEGER CHECK(captured>0),
    captured_revision INTEGER CHECK(captured_revision>=0),
    installed INTEGER NOT NULL DEFAULT 0 CHECK(installed>=0),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision>=0),
    lifecycle INTEGER NOT NULL DEFAULT 0 CHECK(lifecycle IN (0,1)),
    dirty_inodes INTEGER NOT NULL DEFAULT 0 CHECK(dirty_inodes>=0),
    dirty_directory_entries INTEGER NOT NULL DEFAULT 0 CHECK(dirty_directory_entries>=0),
    base_readers INTEGER NOT NULL DEFAULT 0 CHECK(base_readers>=0),
    consolidating INTEGER CHECK(consolidating>0),
    CHECK(captured IS NULL OR consolidating IS NULL),
    CHECK((captured IS NULL)=(captured_revision IS NULL))
) STRICT;
CREATE TABLE inode (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    serial INTEGER NOT NULL CHECK(serial>0),
    gen INTEGER NOT NULL CHECK(gen=-1 OR gen>0),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 3),
    mode INTEGER NOT NULL CHECK(mode>=0 AND ((kind=1 AND mode<=511) OR (kind=2 AND mode<=1023) OR (kind=3 AND mode=511))),
    mtime_seconds INTEGER NOT NULL,
    mtime_nanoseconds INTEGER NOT NULL CHECK(mtime_nanoseconds>=0 AND mtime_nanoseconds<1000000000),
    nlink INTEGER NOT NULL CHECK(nlink>=0),
    size INTEGER NOT NULL CHECK(size>=0),
    inherited_cutoff INTEGER NOT NULL CHECK(inherited_cutoff>=0),
    born INTEGER NOT NULL CHECK(born>=0 AND (gen=-1 OR born<=gen)),
    entries INTEGER NOT NULL CHECK(entries>=0 AND (kind=2 OR entries=0)),
    subdirs INTEGER NOT NULL CHECK(subdirs>=0 AND (kind=2 OR subdirs=0)),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    height INTEGER NOT NULL CHECK(height>=0 AND height<=epoch),
    -- Whether this layer of the file has ever held a reference piece.
    referenced INTEGER NOT NULL DEFAULT 0 CHECK(referenced IN(0,1)),
    -- Content sequence: the Workspace revision that last wrote this row.
    sequence INTEGER NOT NULL DEFAULT 0 CHECK(sequence>=0),
    PRIMARY KEY(ns,serial,gen)
) STRICT, WITHOUT ROWID;
CREATE INDEX inode_capture ON inode(ns,gen,serial);
CREATE TABLE directory_entry (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    parent INTEGER NOT NULL CHECK(parent>0),
    name BLOB NOT NULL CHECK(length(name)>0 AND length(name)<=255),
    gen INTEGER NOT NULL CHECK(gen>0),
    serial INTEGER CHECK(serial>0),
    inherited INTEGER NOT NULL CHECK(inherited IN(0,1)),
    PRIMARY KEY(ns,parent,name,gen)
) STRICT, WITHOUT ROWID;
CREATE INDEX directory_entry_capture ON directory_entry(ns,gen,parent,name);
CREATE TABLE payload (
    rowid INTEGER PRIMARY KEY,
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    serial INTEGER NOT NULL CHECK(serial>0),
    gen INTEGER NOT NULL CHECK(gen=-1 OR gen>0),
    cell_offset INTEGER NOT NULL CHECK(cell_offset>=0 AND cell_offset%4096=0),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    -- One cell at most, or a dense run of whole cells inside one aligned 32768-byte slot.
    data BLOB NOT NULL CHECK(length(data) BETWEEN 1 AND 32768 AND (length(data)<=4096 OR
        (validity IS NULL AND length(data)%4096=0 AND cell_offset/32768=(cell_offset+length(data)-1)/32768))),
    validity BLOB CHECK(validity IS NULL OR length(validity)=(length(data)+7)/8),
    UNIQUE(ns,serial,gen,cell_offset)
) STRICT;
CREATE TABLE shrink (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    serial INTEGER NOT NULL CHECK(serial>0),
    gen INTEGER NOT NULL CHECK(gen=-1 OR gen>0),
    depth INTEGER NOT NULL CHECK(depth>0),
    cell_offset INTEGER NOT NULL CHECK(cell_offset>=0 AND cell_offset%4096=0),
    epoch INTEGER NOT NULL CHECK(epoch>0),
    PRIMARY KEY(ns,serial,gen,depth)
) STRICT, WITHOUT ROWID;
-- A reference piece: `length` bytes of one layer from `file_offset` are the
-- committed bytes of content root `source` from `source_offset`. It holds no
-- bytes. Pieces of one layer never overlap, live or stale; a piece is stale
-- by its first byte and its stamp, like a payload row.
CREATE TABLE payload_reference (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    gen INTEGER NOT NULL CHECK(gen=-1 OR gen>0),
    serial INTEGER NOT NULL CHECK(serial>0),
    file_offset INTEGER NOT NULL CHECK(file_offset>=0 AND file_offset%4096=0),
    length INTEGER NOT NULL CHECK(length>0),
    epoch INTEGER NOT NULL CHECK(epoch>=0),
    source BLOB NOT NULL CHECK(length(source)=32),
    source_offset INTEGER NOT NULL CHECK(source_offset>=0),
    PRIMARY KEY(ns,gen,serial,file_offset)
) STRICT, WITHOUT ROWID;
CREATE INDEX payload_generation ON payload(ns,gen,serial,cell_offset);
CREATE INDEX shrink_generation ON shrink(ns,gen,serial,depth);
CREATE TABLE lease (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 6 OR kind=8),
    owner INTEGER NOT NULL CHECK(owner>0),
    resource INTEGER NOT NULL CHECK(resource>=0),
    PRIMARY KEY(ns,kind,owner,resource)
) STRICT, WITHOUT ROWID;
CREATE TABLE base_source (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    kind INTEGER NOT NULL DEFAULT 0 CHECK(kind BETWEEN 0 AND 2),
    owner INTEGER NOT NULL CHECK(owner>0),
    base_root BLOB NOT NULL CHECK(length(base_root)=32),
    PRIMARY KEY(ns,kind,owner)
) STRICT, WITHOUT ROWID;
CREATE TABLE operation_record (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    operation INTEGER NOT NULL CHECK(operation>0),
    kind INTEGER NOT NULL CHECK(kind>=0),
    key INTEGER NOT NULL CHECK(key>=0),
    value BLOB NOT NULL CHECK(length(value)<=65536),
    PRIMARY KEY(ns,operation,kind,key)
) STRICT, WITHOUT ROWID;

PRAGMA application_id=1279676210;

CREATE INDEX lease_resource ON lease(ns,kind,resource,owner);
CREATE TABLE maintenance (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 1 AND 12),
    resource INTEGER NOT NULL CHECK(resource>=0),
    target INTEGER NOT NULL CHECK(target<>0),
    phase INTEGER NOT NULL DEFAULT 0 CHECK(phase>=0),
    cursor INTEGER NOT NULL DEFAULT 0 CHECK(cursor>=-1),
    aux INTEGER NOT NULL DEFAULT -1 CHECK(aux>=-1),
    name BLOB NOT NULL DEFAULT X'' CHECK(length(name)<=255),
    ready INTEGER NOT NULL DEFAULT 1 CHECK(ready IN(0,1)),
    PRIMARY KEY(ns,kind,resource,target)
) STRICT, WITHOUT ROWID;
CREATE INDEX maintenance_ready ON maintenance(ready,ns,kind,resource,target);
CREATE INDEX maintenance_generation ON maintenance(ns,target,kind,resource);

CREATE TABLE captured_reader (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    request INTEGER NOT NULL CHECK(request>0),
    owner INTEGER NOT NULL CHECK(owner>0),
    gen INTEGER NOT NULL CHECK(gen>0),
    revision INTEGER NOT NULL CHECK(revision>=0),
    base_root BLOB NOT NULL CHECK(length(base_root)=32),
    installed INTEGER NOT NULL CHECK(installed>=0),
    PRIMARY KEY(ns,owner), UNIQUE(ns,request)
) STRICT, WITHOUT ROWID;

CREATE TABLE operation_owner (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    request INTEGER NOT NULL CHECK(request>0),
    owner INTEGER NOT NULL CHECK(owner>0),
    PRIMARY KEY(ns,owner), UNIQUE(ns,request)
) STRICT, WITHOUT ROWID;
CREATE TABLE owned_operation_record (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    operation INTEGER NOT NULL CHECK(operation>0),
    kind INTEGER NOT NULL CHECK(kind>=0),
    key INTEGER NOT NULL CHECK(key>=0),
    value BLOB NOT NULL CHECK(length(value)<=65536),
    PRIMARY KEY(ns,operation,kind,key)
) STRICT, WITHOUT ROWID;
CREATE TABLE indexed_operation_record (
    ns INTEGER NOT NULL REFERENCES workspace(ns),
    operation INTEGER NOT NULL CHECK(operation>0),
    file_scope BLOB NOT NULL CHECK(length(file_scope)=8),
    kind INTEGER NOT NULL CHECK(kind BETWEEN 0 AND 4294967295),
    key BLOB NOT NULL CHECK(length(key)=32),
    value BLOB NOT NULL CHECK(length(value)<=65536),
    PRIMARY KEY(ns,operation,file_scope,kind,key)
) STRICT, WITHOUT ROWID;

PRAGMA user_version=33;
