#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "$0")
export WORKSPACE=$(cd "${SCRIPT_DIR}/.."; pwd)
if [ "${WKTUI_DEV_PROXY}" != "" ]; then
  export WKTUI_PROXY=${WKTUI_DEV_PROXY}
fi

if [ -z "${GH_TOKEN}" ]; then
  echo "GH_TOKEN environment variable must be set prior to running this script">&2
  exit 1
fi

BUILDER_VERSION=14-05.21
WKTUI_ENV_FILE="${WORKSPACE}/docker.env"
echo "WKTUI_USER=$(id -un)" > "${WKTUI_ENV_FILE}"
# shellcheck disable=SC2129
echo "WKTUI_UID=$(id -u)" >> "${WKTUI_ENV_FILE}"
echo "WKTUI_GROUP=$(id -gn)" >> "${WKTUI_ENV_FILE}"
echo "WKTUI_GID=$(id -g)" >> "${WKTUI_ENV_FILE}"
echo "GH_TOKEN=${GH_TOKEN}" >> "${WKTUI_ENV_FILE}"

if [ -n "${WKTUI_PROXY}" ]; then
  echo "HTTPS_PROXY=${WKTUI_PROXY}" >> "${WKTUI_ENV_FILE}"
fi

docker run --rm -v "${WORKSPACE}:/project" --env-file "${WKTUI_ENV_FILE}" electronuserland/builder:${BUILDER_VERSION} /project/build/linuxInstallersInDocker.sh
