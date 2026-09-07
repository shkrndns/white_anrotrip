#!/usr/bin/env bash
# Prevent sleep/idle while Cursor Remote Control runs tool calls on this machine.
# Usage: ./scripts/cursor-remote-control-awake.sh
# Stop: Ctrl+C
set -euo pipefail

if ! command -v systemd-inhibit >/dev/null 2>&1; then
	echo "systemd-inhibit not found. Install systemd or keep the machine awake manually." >&2
	exit 1
fi

echo "Cursor Remote Control: blocking sleep/idle (Ctrl+C to stop)."
echo "Keep Cursor open and connected to the internet."

exec systemd-inhibit \
	--what=idle:sleep:handle-lid-switch:handle-suspend-key:handle-hibernate-key \
	--who="Cursor Remote Control" \
	--why="Agent tools run locally on this computer" \
	--mode=block \
	sleep infinity
