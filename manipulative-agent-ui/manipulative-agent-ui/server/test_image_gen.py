"""Test: generate one image and upload it."""

import sys
sys.path.insert(0, "/mnt/pfs/zitao_team/zengxiaoli/Multimodal_LessonPlan/code/manipulative-agent-ui")

from server.services.image_service import generate_single_image

print("Testing image generation...")
try:
    url = generate_single_image("A simple blue fraction bar, flat cartoon style, educational math element, transparent background")
    print(f"SUCCESS! Image URL: {url}")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
