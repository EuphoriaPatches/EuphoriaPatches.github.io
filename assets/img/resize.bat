@echo off
setlocal enabledelayedexpansion

REM Navigate to the script's directory
cd /d "%~dp0"

REM Ask for the image extension
:ask_extension
set /p "extension=What should the detected image extension be (.png, .jpg, .webp...)? "
if /i "%extension%" neq ".png" if /i "%extension%" neq ".jpg" if /i "%extension%" neq ".webp" (
    echo Error: Unknown image extension. Please use .png, .jpg, or .webp.
    goto ask_extension
)

REM Ask if both width and height should be changed
set /p "change_both=Do you want to change both width and height? (y/n): "

if /i "%change_both%" equ "y" (
    REM Ask for resize resolutions
    set /p "resize_res=Please input resize resolutions (WidthxHeight, e.g., 854x480 1280x720): "
) else (
    REM Ask which dimension to change
    set /p "dimension=Do you want to change width or height? (w/h): "
    if /i "!dimension!" equ "w" (
        set /p "sizes=Please input all possible widths (e.g., 854 1280 1920): "
    ) else (
        set /p "sizes=Please input all possible heights (e.g., 480 720 1080): "
    )
)

REM Process all files with the specified extension in the current directory
for %%F in (*%extension%) do (
    set "input=%%~fF"
    set "baseName=%%~nF"
    
    if /i "%change_both%" equ "y" (
        for %%R in (!resize_res!) do (
            for /f "tokens=1,2 delims=x" %%a in ("%%R") do (
                set "width=%%a"
                set "height=%%b"
                set "output=!baseName!-!width!x!height!%extension%"
                ffmpeg -i "!input!" -vf "scale=!width!:!height!" "!output!"
            )
        )
    ) else (
        for %%S in (!sizes!) do (
            if /i "!dimension!" equ "w" (
                set "output=!baseName!-%%Sw%extension%"
                ffmpeg -i "!input!" -filter:v "scale=%%S:ih" -c:a copy "!output!"
            ) else (
                set "output=!baseName!-%%Sh%extension%"
                ffmpeg -i "!input!" -filter:v "scale=iw:%%S" -c:a copy "!output!"
            )
        )
    )
)

echo Processing complete.
pause