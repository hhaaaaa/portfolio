$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeVersion = (Get-Content -LiteralPath (Join-Path $projectRoot '.node-version') -Raw).Trim()
$runtimePath = Join-Path $projectRoot ".tools/node-v$nodeVersion-win-x64"
$nodePath = Join-Path $runtimePath 'node.exe'
$npmPath = Join-Path $runtimePath 'node_modules/npm/bin/npm-cli.js'
if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Project-local Node.js $nodeVersion is missing. Install Node.js $nodeVersion with a version manager and use npm directly, or prepare the official Windows runtime under $runtimePath. See README.md."
}
$previousPath = $env:PATH
Push-Location $projectRoot
try {
  $env:PATH = "$runtimePath;$previousPath"
  $npmArguments = @($args)
  # PowerShell consumes a standalone -- when invoking a script.
  # Restore npm's separator before arguments forwarded to an npm run script.
  if ($npmArguments.Count -gt 2 -and $npmArguments[0] -eq 'run' -and $npmArguments[2] -ne '--') {
    $npmArguments = @($npmArguments[0], $npmArguments[1], '--') + $npmArguments[2..($npmArguments.Count - 1)]
  }
  & $nodePath $npmPath @npmArguments
  $commandExitCode = $LASTEXITCODE
} finally {
  $env:PATH = $previousPath
  Pop-Location
}
exit $commandExitCode

