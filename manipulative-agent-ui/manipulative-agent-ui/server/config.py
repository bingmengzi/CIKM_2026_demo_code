"""Configuration for the ManipulativeAgent backend."""

from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
SERVER_ROOT = Path(__file__).parent
OUTPUT_DIR = PROJECT_ROOT / "output"

# LLM model mapping (现在可以直接填写通用大模型名称，例如 gpt-4o, deepseek-chat 等)
LLM_TASK_MAIN = "gemini-3.1-pro-preview"         # 主力生成模型
LLM_TASK_CODE = "gemini-3.1-pro-preview"         # 代码生成专用模型
LLM_TASK_VERIFY = "gemini-3.1-pro-preview"       # 验证与判断模型
LLM_TASK_IMAGE = "gemini-3-pro-image-preview"             # 图像生成模型

# 统一 API 配置
LLM_API_KEY = "sk-dd6RNMgExpaELGLkcESjXrO4Q1vFI1D3rqgIohS87fDzvYEb"
LLM_API_URL = "https://www.msuicode.com/v1"

IMAGE_API_KEY = "sk-7py85fKLExjParjcTSaUrDUsJxhxiAFAZfijcKMv967LHe3l"
IMAGE_API_URL = "https://www.msuicode.com/v1"

# Component library
COMPONENT_MAPPING_PATH = SERVER_ROOT / "data" / "component_mapping.json"

# HTML framework template
HTML_TEMPLATE_PATH = SERVER_ROOT / "data" / "activity_framework.html"

# Selenium config - pointing to a local file containing CHROME_PATH and CHROMEDRIVER_PATH
SELENIUM_CONFIG_PATH = SERVER_ROOT / "data" / "selenium_config.txt"

# Limits
MAX_VERIFY_RETRIES = 5
MAX_CONCURRENT_IMAGES = 4
MAX_CONCURRENT_ASSETS = 8
