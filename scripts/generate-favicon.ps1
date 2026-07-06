Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$srcPath = Join-Path $root "app\apple-icon.png"
$outIcon = Join-Path $root "public\icon.png"
$size = 96
$padding = [int]($size * 0.08)

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.DrawImage($src, $padding, $padding, $size - 2 * $padding, $size - 2 * $padding)
$g.Dispose()
$src.Dispose()

$bmp.Save($outIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Get-Item $outIcon | Format-Table Name, Length
