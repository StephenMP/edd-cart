#!/bin/bash -e

while getopts n: flag
do
    case "${flag}" in
        n) NAME=${OPTARG};;
        \? ) echo "Unknown option: -$OPTARG" >&2; exit 1;;
        :  ) echo "Missing option argument for -$OPTARG" >&2; exit 1;;
        *  ) echo "Unimplemented option: -$OPTARG" >&2; exit 1;;
    esac
done

yarn nx serve $NAME --inspect
