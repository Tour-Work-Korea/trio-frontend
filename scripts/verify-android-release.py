"""Validate the actual AAB before handing it to the Play Console operator."""

import argparse
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path)
    parser.add_argument("--bundletool", required=True, type=Path)
    parser.add_argument("--version-code", required=True, type=int)
    parser.add_argument("--version-name", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    command = ["java", "-jar", str(args.bundletool)]
    validation = subprocess.run(
        command + ["validate", f"--bundle={args.bundle}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if validation.returncode:
        raise SystemExit(validation.stdout)
    manifest = subprocess.check_output(
        command + ["dump", "manifest", f"--bundle={args.bundle}", "--module=base"],
        text=True,
    )
    root = ET.fromstring(manifest)
    android = "{http://schemas.android.com/apk/res/android}"
    sdk = root.find("uses-sdk")
    application = root.find("application")
    activity = next(
        item for item in application.findall("activity")
        if item.get(android + "name") in (".MainActivity", "com.triofrontendapp.MainActivity")
    )
    result = {
        "applicationId": root.get("package"),
        "versionCode": int(root.get(android + "versionCode")),
        "versionName": root.get(android + "versionName"),
        "targetSdk": int(sdk.get(android + "targetSdkVersion")),
        "minSdk": int(sdk.get(android + "minSdkVersion")),
        "enableOnBackInvokedCallback": activity.get(android + "enableOnBackInvokedCallback"),
        "sha256": hashlib.sha256(args.bundle.read_bytes()).hexdigest(),
    }
    expected = {
        "applicationId": "com.triofrontendapp",
        "versionCode": args.version_code,
        "versionName": args.version_name,
        "enableOnBackInvokedCallback": "false",
    }
    for key, value in expected.items():
        if result[key] != value:
            raise SystemExit(f"AAB {key}: expected {value!r}, got {result[key]!r}")
    if result["targetSdk"] < 36:
        raise SystemExit(f"AAB targetSdk must be at least 36: {result['targetSdk']}")
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
