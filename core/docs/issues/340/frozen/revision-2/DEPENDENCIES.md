# Crew frozen dependency selection

> Status: Frozen revision 1 diagnostic campaign inputs; not release evidence.

A1 queried npm from a mounted LayerFS Workspace with fetch retries disabled.
The exact direct npm dependencies are express 4.22.3, preact 11.0.1 and esbuild 0.28.2.
Each application package manifest must use exact versions and commit its npm lockfile.
Node 22.23.1 and npm 10.9.8 come from the pinned ENVIRONMENT.json image. node:sqlite
loads without a flag and emits an ExperimentalWarning. No additional npm browser
dependency is needed: the pinned image supplies Chromium, ChromeDriver and Python
Selenium. The team must run the required real browser smoke through that driver.

Run npm with fetch-retries=0 and bounded fetch-timeout; every command remains within
inner timeout 110 and outer wall <=120 seconds. Transitive packages resolve through
the application lockfile, and both builds pin and retain their exact lockfile SHA256.
No native addon, external database or application network service is permitted.

Raw registry/browser evidence: core/target/issue340/phase-a/a1-runtime-corrected.json
and receipts/007-runtime-browser-packages.stdout (external evidence copy at closure).
