#param( [Parameter(Mandatory=$true)][string]$source )

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $rootDir "src\resume.js.net.xml"

function ConvertSourceToHtml( $source, $destination )
    {
    $xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
    $xslt.Load( ( Join-Path $rootDir "src\transformations\resume-to-html.xsl" ) );
    $xslt.Transform( $source, $destination );    
    }
    
function ConvertSourceToWord( $source, $destination )
    {
    $private:xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
    $xslt.Load( ( Join-Path $rootDir "src\transformations\resume-to-word.xsl" ) );
    $tempFile = [System.IO.Path]::GetTempFileName()
    $xslt.Transform( $source, $tempFile );    
    
    $private:wrd = new-object -com word.application 
    $wrd.visible = $true 
    $doc = $wrd.documents.open( $tempFile )
    $doc.SaveAs( $destination, 16 )
    $doc.close()
    $wrd.quit()
    }

function ConvertSourceToPDF( $source, $destination )
    {
    $private:xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
    $xslt.Load( ( Join-Path $rootDir "src\transformations\resume-to-word.xsl" ) );
    $tempFile = [System.IO.Path]::GetTempFileName()
    $xslt.Transform( $source, $tempFile );    
    
    $private:wrd = new-object -com word.application 
    $wrd.visible = $true 
    $doc = $wrd.documents.open( $tempFile )
    $doc.SaveAs( $destination, 17 )
    $doc.close()
    $wrd.quit()
    }
    
ConvertSourceToHtml $source ( Join-Path $rootDir "bin\Resume.html" )
ConvertSourceToWord $source ( Join-Path $rootDir "bin\Resume.docx" )
ConvertSourceToPDF $source ( Join-Path $rootDir "bin\Resume.pdf" )