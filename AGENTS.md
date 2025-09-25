# Repository Guidelines

## Project Structure & Module Organization
The Go HTTP service lives in `main.go`, which wires routes such as `/health`, `/api/process`, and `/api/probe`. The static upload interface is in `index.html` and is served from the repository root. Keep FFmpeg-related helpers near the bottom of `main.go`; add new packages only when behaviour becomes large enough to justify a separate module under a new directory.

## Build, Test, and Development Commands
- `go run main.go` starts the local server on `http://localhost:8080` for rapid iteration.
- `go build -o videoprocessor` produces a self-contained binary you can ship or run via `./videoprocessor`.
- `go test ./...` executes all Go tests; pair with `-v` for detailed logs and `-run` to target specific suites.

## Coding Style & Naming Conventions
Format every change with `gofmt` (tabs for indentation, trimmed imports). Prefer `goimports` if you add packages. Follow Go naming: exported identifiers in PascalCase, unexported in camelCase. Keep log messages concise and, when adding filters or presets, document non-obvious FFmpeg arguments with short inline comments.

## Testing Guidelines
Organise tests as table-driven cases in `*_test.go` files beside the code under test. Name functions `TestFunction_Scenario` to clarify intent. Use `go test ./... -cover` to watch coverage, and include representative sample media clips inside temporary dirs; never commit binaries. When adding FFmpeg interactions, stub external commands where possible or guard integration tests behind build tags.

## Commit & Pull Request Guidelines
Write imperative, descriptive subject lines (e.g. `feat: extend AV1 presets`) and explain rationale plus testing evidence in the body. Reference related issues or media samples when relevant. Pull requests should outline behaviour changes, list manual test commands (such as `curl /api/process` invocations), and attach output snippets or screenshots when UI tweaks affect `index.html`.

## FFmpeg & Environment Tips
Ensure FFmpeg is available with WebP support by running `ffmpeg -hide_banner -encoders | grep webp`. Use `/api/probe` during reviews to capture encoder lists in PR descriptions. Clean up temporary work directories and verify uploads stay below the 1 GiB request limit enforced in `handleProcess`.
