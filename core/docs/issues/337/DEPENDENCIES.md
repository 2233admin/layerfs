# Frozen dependency policy and manifests

> **Status:** Current planning checklist; no release candidate exists.

Scope: #337. Exact pins verified live with Cargo 1.85.1. Cargo.lock contains 157 registry packages.
The four packages and their dependencies must use the following manifests in both
builders so the frozen Cargo.lock remains valid. Implementations are independent.
Non-dependency package metadata, README/include fields and implementation targets
may be added without changing the frozen dependency graph. SQLite uses system 3.40.1 from the pinned runtime image, not bundled compilation.
No new dependencies, source patches, external Cargo cache, sccache, or host-built
Depot artifacts. Toolchain comes from image; CARGO_HOME and target stay in view.

## Cargo.toml

```toml
[workspace]
members = ["crates/depot-domain", "crates/depot-store", "crates/depot-server", "crates/depot-cli"]
resolver = "2"

[workspace.package]
version = "0.1.0"
edition = "2021"
rust-version = "1.85"
license = "MIT"

[workspace.dependencies]
depot-domain = { path = "crates/depot-domain", version = "=0.1.0" }
depot-store = { path = "crates/depot-store", version = "=0.1.0" }
axum = { version = "=0.8.1", default-features = false, features = ["http1", "json", "tokio"] }
tokio = { version = "=1.43.0", default-features = false, features = ["macros", "rt-multi-thread", "net", "fs", "io-util", "signal", "sync", "time"] }
rusqlite = { version = "=0.32.1", default-features = false }
serde = { version = "=1.0.217", features = ["derive"] }
serde_json = "=1.0.137"
sha2 = "=0.10.8"
futures-util = { version = "=0.3.31", default-features = false, features = ["std"] }
tokio-util = { version = "=0.7.13", default-features = false, features = ["io"] }
bytes = "=1.9.0"
reqwest = { version = "=0.12.12", default-features = false, features = ["json", "stream"] }
clap = { version = "=4.5.27", features = ["derive"] }
thiserror = "=2.0.11"

[profile.dev]
debug = 0
incremental = false

[profile.test]
debug = 0
incremental = false
```

## .cargo/config.toml

```toml
[resolver]
incompatible-rust-versions = "fallback"
[net]
retry = 0
[http]
timeout = 30
```

## crates/depot-domain/Cargo.toml

```toml
[package]
name = "depot-domain"
version.workspace = true
edition.workspace = true
rust-version.workspace = true
license.workspace = true

[dependencies]
serde.workspace = true
thiserror.workspace = true
```

## crates/depot-store/Cargo.toml

```toml
[package]
name = "depot-store"
version.workspace = true
edition.workspace = true
rust-version.workspace = true
license.workspace = true

[dependencies]
depot-domain.workspace = true
rusqlite.workspace = true
sha2.workspace = true
tokio.workspace = true
futures-util.workspace = true
serde.workspace = true
serde_json.workspace = true
```

## crates/depot-server/Cargo.toml

```toml
[package]
name = "depot-server"
version.workspace = true
edition.workspace = true
rust-version.workspace = true
license.workspace = true

[dependencies]
depot-domain.workspace = true
depot-store.workspace = true
axum.workspace = true
tokio.workspace = true
tokio-util.workspace = true
futures-util.workspace = true
serde.workspace = true
serde_json.workspace = true
bytes.workspace = true

[dev-dependencies]
reqwest.workspace = true
```

## crates/depot-cli/Cargo.toml

```toml
[package]
name = "depot-cli"
version.workspace = true
edition.workspace = true
rust-version.workspace = true
license.workspace = true

[dependencies]
depot-domain.workspace = true
clap.workspace = true
reqwest.workspace = true
tokio.workspace = true
futures-util.workspace = true
tokio-util.workspace = true
serde_json.workspace = true
```
