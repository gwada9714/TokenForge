# Lire le contenu du fichier Navbar.tsx
$navbarContent = Get-Content -Path "src\components\layouts\main\Navbar.tsx" -Raw

# Trouver la position de "Polygon</Typography>"
$insertPosition = $navbarContent.IndexOf("Polygon</Typography>")
if ($insertPosition -eq -1) {
    Write-Host "Impossible de trouver le point d'insertion"
    exit 1
}

# Ajouter la longueur de "Polygon</Typography>"
$insertPosition += "Polygon</Typography>".Length

# Lire le contenu du fichier de complétion
$completionContent = Get-Content -Path "src\components\layouts\main\Navbar.tsx.completion" -Raw

# Créer le nouveau contenu en conservant la partie après le point d'insertion
$newContent = $navbarContent.Substring(0, $insertPosition) + $completionContent + $navbarContent.Substring($insertPosition)

# Écrire le nouveau contenu dans un fichier temporaire
$newContent | Set-Content -Path "src\components\layouts\main\Navbar.tsx.new" -Encoding UTF8

# Remplacer le fichier original par le nouveau fichier
Move-Item -Path "src\components\layouts\main\Navbar.tsx.new" -Destination "src\components\layouts\main\Navbar.tsx" -Force

Write-Host "Fusion terminée avec succès"
