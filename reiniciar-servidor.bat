@echo off
echo ========================================
echo    REINICIANDO SERVIDOR POSVENDAS PRO
echo ========================================
echo.

echo [1/3] Parando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Gerando Prisma Client...
call npx prisma generate

echo.
echo [3/3] Iniciando servidor...
echo.
echo Servidor iniciando em http://localhost:3000
echo Pressione Ctrl+C para parar
echo.

call npm run dev

