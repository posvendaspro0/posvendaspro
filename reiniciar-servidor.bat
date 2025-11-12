@echo off
echo ========================================
echo    REINICIANDO SERVIDOR POSVENDAS PRO
echo ========================================
echo.

echo [1/4] Parando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 >nul

echo [2/4] Limpando cache do Next.js...
if exist .next rmdir /s /q .next
timeout /t 1 >nul

echo [3/4] Gerando Prisma Client...
call npx prisma generate

echo.
echo [4/4] Iniciando servidor...
echo.
echo Servidor iniciando em http://localhost:3000
echo Pressione Ctrl+C para parar
echo.

call npm run dev

