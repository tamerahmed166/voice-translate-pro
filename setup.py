#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="voice-translator-pro",
    version="1.0.0",
    author="Voice Translator Team",
    author_email="team@voice-translator-pro.com",
    description="تطبيق ويب متقدم للترجمة الصوتية والنصية يدعم أكثر من 100 لغة",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-username/voice-translator-pro",
    project_urls={
        "Bug Reports": "https://github.com/your-username/voice-translator-pro/issues",
        "Source": "https://github.com/your-username/voice-translator-pro",
        "Documentation": "https://your-username.github.io/voice-translator-pro/",
    },
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Multimedia :: Sound/Audio :: Speech",
        "Topic :: Text Processing :: Linguistic",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=4.1.0",
            "black>=23.11.0",
            "isort>=5.12.0",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
            "mkdocs>=1.5.3",
            "mkdocs-material>=9.4.8",
            "prometheus-client>=0.19.0",
            "structlog>=23.2.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "voice-translator=voice_translator_pro.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
