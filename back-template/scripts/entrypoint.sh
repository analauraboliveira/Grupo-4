#!/bin/ash
echo "Running start script with user $(whoami) and NODE_ENV $NODE_ENV"

if [ "$NODE_ENV" == "production" ]
then
  bun prisma migrate deploy
fi

# TODO: migrate to bun
# but take care with sentry compatbility
# / $ ./scripts/entrypoint.sh
# Running start script with user node and NODE_ENV development
# 123 |         }
# 124 |         if (abi === '115') {
# 125 |           return createdRequire('../sentry_cpu_profiler-linux-x64-musl-115.node');
# 126 |         }
# 127 |         if (abi === '127') {
# 128 |           return createdRequire('../sentry_cpu_profiler-linux-x64-musl-127.node');
#                        ^
# error: Error relocating /node_modules/@sentry/profiling-node/lib/sentry_cpu_profiler-linux-x64-musl-127.node: _ZN2v811CpuProfiler13StopProfilingENS_5LocalINS_6StringEEE: symbol not found
#  code: "ERR_DLOPEN_FAILED"

#       at importCppBindingsModule (/node_modules/@sentry/profiling-node/lib/cjs/index.js:128:18)
#       at <anonymous> (/node_modules/@sentry/profiling-node/lib/cjs/index.js:183:36)
#       at <anonymous> (/dist/src/main.js:4:7)

# Bun v1.2.2 (Linux x64)
exec dumb-init node dist/src/main.js