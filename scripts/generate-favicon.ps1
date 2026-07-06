Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$srcPath = Join-Path $root "app\apple-icon.png"
$outIco = Join-Path $root "app\favicon.ico"
$outIcon = Join-Path $root "app\icon.png"
$size = 48

$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$padding = [int]($size * 0.08)
$g.DrawImage($src, $padding, $padding, $size - 2 * $padding, $size - 2 * $padding)
$bmp.Save($outIcon, [System.Drawing.Imaging.ImageFormat]::Png)

$iconBitmap = [System.Drawing.Bitmap]::FromFile($outIcon)
$iconHandle = $iconBitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$fs = [System.IO.File]::Create($outIco)
$icon.Save($fs)
$fs.Close()

$g.Dispose()
$bmp.Dispose()
$icon.Dispose()
$iconBitmap.Dispose()
$src.Dispose()

Get-Item $outIco, $outIcon | Format-Table Name, Length
