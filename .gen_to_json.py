#!/usr/bin/env python3
import sys
import json
from pathlib import Path

def read_input(path: str) -> str:
    if path == "-":
        return sys.stdin.read()
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return p.read_text(encoding="utf-8")

def write_output(path: str, obj) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=4)

def main(argv):
    if len(argv) != 3:
        print("Usage: format_to_json.py <input_file_or_-> <output_file>")
        print("Use '-' as input_file to read from stdin.")
        return 1

    input_path = argv[1]
    output_path = argv[2]

    try:
        text = read_input(input_path)
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        return 2

    payload = {
        "article": text
    }

    try:
        write_output(output_path, payload)
    except Exception as e:
        print(f"Error writing output: {e}", file=sys.stderr)
        return 3

    print(f"Written JSON to {output_path}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
