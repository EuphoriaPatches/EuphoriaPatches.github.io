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
    REM Ask if user wants to do it manually or automatically
    set /p "manual_or_auto=Do you want to do it manually or automatically (m/a)? "
) else (
    REM Ask which dimension to change
    set /p "dimension=Do you want to change width or height? (w/h): "
    if /i "!dimension!" equ "w" (
        set /p "sizes=Please input all possible widths (e.g., 854 1280 1920): "
    ) else (
        set /p "sizes=Please input all possible heights (e.g., 480 720 1080): "
    )
)

REM Handle manual resizing
if /i "%change_both%" equ "y" (
    if /i "%manual_or_auto%" equ "m" (
        REM Ask for resize resolutions
        set /p "resize_res=Please input resize resolutions (WidthxHeight, e.g., 854x480 1280x720): "
    ) else (
        REM Automatic dimension input
        set /p "auto_res=Please input either width or height the other will be automatic (WidthxA | AxHeight, e.g, 1280xA Ax480): "
    )
)

REM Ask if user wants to overwrite existing files
set /p "overwrite=Do you want to overwrite existing files? (y/n): "
if /i "%overwrite%" equ "y" (
    set "ffmpeg_overwrite=-y"
) else (
    set "ffmpeg_overwrite=-n"
)

REM Process all files with the specified extension in the current directory
for %%F in (*%extension%) do (
    set "input=%%~fF"
    set "baseName=%%~nF"

    REM Check if the file has already been processed
    echo %%F | findstr /r /c:"-[0-9]*x[0-9]*" > nul
    if errorlevel 1 (
        echo %%F | findstr /r /c:"-[0-9]*w" > nul
        if errorlevel 1 (
            echo %%F | findstr /r /c:"-[0-9]*h" > nul
            if errorlevel 1 (
                echo %%F | findstr /r /c:"-Auto[0-9]*x" > nul
                if errorlevel 1 (
                    echo %%F | findstr /r /c:"-[0-9]*xAuto" > nul
                    if errorlevel 1 (
                        REM Use ImageMagick to get width and height
                        for /f "tokens=1,2 delims=x " %%l in ('magick identify -format "%%w x %%h" "!input!" 2^>nul') do (
                            set "original_width=%%l"
                            set "original_height=%%m"
                        )

                        REM Process the file
                        if /i "%change_both%" equ "y" (
                            if /i "%manual_or_auto%" equ "m" (
                                REM Manual resizing
                                for %%R in (!resize_res!) do (
                                    for /f "tokens=1,2 delims=x" %%a in ("%%R") do (
                                        set "width=%%a"
                                        set "height=%%b"
                                        set "output=!baseName!-!width!x!height!%extension%"
                                        ffmpeg -i "!input!" -vf "scale=!width!:!height!" !ffmpeg_overwrite! "!output!"
                                    )
                                )
                            ) else (
                                REM Automatic dimension handling
                                for %%R in (!auto_res!) do (
                                    for /f "tokens=1,2 delims=x" %%A in ("%%R") do (
                                        set "width=%%A"
                                        set "height=%%B"

                                        if "!height!" == "A" (
                                            REM Calculate height based on width
                                            ffmpeg -i "!input!" -vf "scale=!width!:-1" !ffmpeg_overwrite! "!baseName!-!width!xAuto%extension%"
                                        ) else if "!width!" == "A" (
                                            REM Calculate width based on height
                                            ffmpeg -i "!input!" -vf "scale=-1:!height!" !ffmpeg_overwrite! "!baseName!-Auto!height!x%extension%"
                                        ) else (
                                            echo Error: Invalid input. Please use WidthxA or AxHeight format.
                                        )
                                    )
                                )
                            )
                        ) else (
                            for %%S in (!sizes!) do (
                                if /i "!dimension!" equ "w" (
                                    set "output=!baseName!-%%Sw%extension%"
                                    ffmpeg -i "!input!" -vf "crop=%%S:!original_height!:(in_w-%%S)/2:0" !ffmpeg_overwrite! "!output!"
                                ) else (
                                    set "output=!baseName!-%%Sh%extension%"
                                    ffmpeg -i "!input!" -vf "crop=!original_width!:%%S:(in_w-%%S)/2:0" !ffmpeg_overwrite! "!output!"
                                )
                            )
                        )
                    )
                )
            )
        )
    )
)

echo Processing complete.
pause
