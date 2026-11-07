# Clock recovery

The user reported successful macOS `--validate-clock` and `--validate-guardian`
runs: normal restoration, parent loss and forced guardian termination with
journal recovery. The 26-day journey itself has not yet been run.

Before changing the system clock, the guardian stores a private root-owned
recovery record, flushes it and its directory, and refuses a pre-existing
record. It verifies record ownership, permissions, file type, link count and
schema. macOS continuous time, including sleep, provides elapsed time;
`kern.bootsessionuuid` identifies the boot. After verifying restored wall time
and the original automatic-time setting, the guardian removes the record.

The root guardian restores on normal completion, control-pipe closure, signals
and timeout. The launcher reports its private evidence directory; a failed
journey retains its video, screenshot when available, and sanitized evidence.
If restoration is not confirmed, use the launcher's separate `--recover-clock`
action after ensuring the guardian is no longer active. It verifies and uses
only the existing record. Never run recovery concurrently with the guardian.

If the machine has rebooted since the record was created, the continuous-clock
baseline cannot be compared. Automatic recovery refuses the record: recover
time from an independently trusted source and resolve the original
automatic-time setting manually. If the supervisor itself is forcibly killed
or the machine loses power, a running process cannot guarantee recovery.

Simulated tests cover normal completion, parent loss, signals, timeout,
concurrency, forced guardian termination, recovery and injected failure. They
do not prove every possible failure of the full filmed journey.
