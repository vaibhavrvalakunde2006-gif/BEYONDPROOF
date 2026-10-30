"""Utility to generate the Judge Demonstration Asset:
'CANON_EOS5D_AI_LAUNDERED.JPG'

An AI-generated square image that was:
1. Re-photographed / displayed with a subtle periodic Moiré lattice (screen recapture).
2. Saved with standard software IJG quantization tables.
3. Injected with forged Canon EOS 5D Mark IV metadata (f/1.4, ISO 6400).
Demonstrates the platform detecting:
- 2D FFT Moiré screen recapture
- Physical sensor resolution mismatch (Square 1024x1024 vs 30.4MP 3:2)
- Hardware ISP vs IJG Software quantization table mismatch
- Optical aperture vs infinite depth-of-field contradiction
- Sensor ISO vs zero photon shot noise contradiction
- The Authenticity Verdict: 'METADATA_FORGERY_DETECTED' and 'LAUNDERED_SUSPECT'
"""

import os
import numpy as np
import cv2
from PIL import Image
import piexif

def create_laundered_fake_sample(output_path: str) -> str:
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    size = 1024
    img = np.zeros((size, size, 3), dtype=np.uint8)

    # Base gradient / scene
    for y in range(size):
        for x in range(size):
            r = int(120 + 80 * np.sin(x / 60.0))
            g = int(100 + 70 * np.cos(y / 70.0))
            b = int(160 + 60 * np.sin((x + y) / 90.0))
            img[y, x] = [b, g, r]

    # Add high-frequency periodic 2D Moiré lattice wave (screen subpixel grid interference)
    # Off-axis frequencies (e.g. fx=28, fy=34 cycles across 512px)
    y_idx, x_idx = np.mgrid[:size, :size]
    moire_pattern = 18.0 * np.sin(2 * np.pi * (x_idx * 56 / size + y_idx * 68 / size))
    moire_pattern += 14.0 * np.cos(2 * np.pi * (-x_idx * 48 / size + y_idx * 60 / size))
    img = np.clip(img.astype(np.float32) + moire_pattern[:, :, np.newaxis], 0, 255).astype(np.uint8)

    # Add sharp geometric features at edges to simulate uniform infinite depth of field (contradicting f/1.4)
    cv2.circle(img, (200, 200), 120, (255, 255, 255), 4)
    cv2.circle(img, (824, 200), 120, (255, 255, 255), 4)
    cv2.circle(img, (200, 824), 120, (255, 255, 255), 4)
    cv2.circle(img, (824, 824), 120, (255, 255, 255), 4)
    cv2.circle(img, (512, 512), 160, (255, 255, 255), 4)

    # Forged EXIF Metadata targeting professional DSLR Canon EOS 5D Mark IV
    exif_dict = {
        "0th": {
            piexif.ImageIFD.Make: b"Canon",
            piexif.ImageIFD.Model: b"Canon EOS 5D Mark IV",
            piexif.ImageIFD.Software: b"Canon EOS 5D Mark IV Firmware Ver 1.3.3",
            piexif.ImageIFD.DateTime: b"2026:10:30 18:45:00",
        },
        "Exif": {
            piexif.ExifIFD.DateTimeOriginal: b"2026:10:30 18:45:00",
            piexif.ExifIFD.DateTimeDigitized: b"2026:10:30 18:45:00",
            piexif.ExifIFD.FNumber: (14, 10),  # f/1.4 wide aperture
            piexif.ExifIFD.ISOSpeedRatings: 6400,  # ISO 6400
            piexif.ExifIFD.FocalLength: (50, 1),  # 50mm f/1.4 lens
            piexif.ExifIFD.ExposureTime: (1, 500),  # 1/500s
        },
    }
    exif_bytes = piexif.dump(exif_dict)

    # Save via PIL with Standard Quality 75 (producing IJG software quantization table)
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    pil_img.save(output_path, "JPEG", quality=75, exif=exif_bytes)
    return output_path

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "sample_data", "CANON_EOS5D_AI_LAUNDERED.JPG")
    create_laundered_fake_sample(out)
    print(f"Sample generated at: {out}")
