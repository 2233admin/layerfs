#!/bin/sh
# One S4/S3 stage in the scale runner container (own name; never the lead's runner).
# usage: run.sh prep|play|merge|close     (caller wraps it in a ≤120 s timeout)
set -eu
W=/Users/yifanxu/Ephemeral-AI-Lab/layerfs-352-scale
T=/Users/yifanxu/Ephemeral-AI-Lab/layerfs/core/target/issue352
D=/Users/yifanxu/lfs-history/scale-experiments/s4
IMG=$(docker image inspect --format '{{.Id}}' layerfs-352-runtime:node24)
HOSTSOCK=$(docker context inspect --format '{{.Endpoints.docker.Host}}' | sed 's#^unix://##')
exec docker run --rm --name layerfs-issue352-scale-runner --init \
  -v "$W:$W:ro" -v "$D:$D" -v "$T:$T:ro" \
  -v layerfs-issue352-scale-s4:/layerfs-store \
  -v /var/run/docker.sock:/var/run/docker.sock -v "/var/run/docker.sock:$HOSTSOCK" \
  -e HOME=$D -e LAYERFS_HOME=$D/home -e LAYERFS_DOCKER=/var/run/docker.sock \
  -e LAYERFS_IMAGE=sha256:d3773b4eac6a7a644887b17e36956cd1553786d47103f0170a3bb2b0ff6988de \
  -e LAYERFS_VOLUME=layerfs-issue352-scale-s4 \
  -e LAYERFS_DAEMON=$T/daemon-128a959c/layerfs-daemon \
  -e LAYERFS_NATIVE=$T/sdk-linux-74d08425/layerfs.node \
  -e LAYERFS_CONTAINER_PREFIX=layerfs-issue352-scale-s4- \
  -e LAYERFS_CONSTRUCTION_WORKERS=1 \
  -e LAYERFS_STORE_PATH=/layerfs-store/global/store.sqlite \
  -e LAYERFS_DAEMON_HOST=host.docker.internal \
  -w "$D" --entrypoint node "$IMG" "$D/s4.mjs" "$1"
