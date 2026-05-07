# Solar Guide Site Laragon Install

Use this guide to install the Solar Guide Site package on another Windows computer running Laragon. The install should be treated as a separate copy from the current development machine.

## Package Contents

The deployment package is expected to contain:

```text
app\solar-guide-site\
database\solar-guide-site.sql
LARAGON_INSTALL.md
```

If you are already looking at the Laravel app root, you should see files such as `artisan`, `composer.json`, `.env.laragon.example`, `routes`, `resources`, `public`, and `storage`.

## Requirements On The Second Computer

- Laragon with Apache or Nginx and MySQL/MariaDB enabled
- PHP 8.2 or newer
- Composer
- Node.js and npm only if frontend assets need to be rebuilt
- PHP extensions normally used by Laravel: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`, `curl`, and `zip`

## 1. Copy The Package

Copy the whole package folder or the `.zip` file to the second computer.

Recommended temporary location:

```text
C:\Users\Public\Downloads\solar-guide-site-package
```

Recommended final app location:

```text
C:\laragon\www\solar-guide-site
```

## 2. Extract The App

Inside the package, the Laravel app is here:

```text
app\solar-guide-site
```

Copy the contents of that folder into:

```text
C:\laragon\www\solar-guide-site
```

After copying, this file should exist:

```text
C:\laragon\www\solar-guide-site\artisan
```

Avoid this double-nested path:

```text
C:\laragon\www\solar-guide-site\solar-guide-site\artisan
```

## 3. Create The Database

Open Laragon, start MySQL/MariaDB, then create a database named:

```text
solar_guide_site
```

You can create it in phpMyAdmin, HeidiSQL, Adminer, or the Laragon terminal.

CLI example with a MySQL root password:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS solar_guide_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

CLI example when root has no password:

```powershell
mysql -u root -e "CREATE DATABASE IF NOT EXISTS solar_guide_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

If you use a different database name, update `.env` to match.

## 4. Configure The Environment

Open:

```text
C:\laragon\www\solar-guide-site
```

Copy:

```text
.env.laragon.example
```

to:

```text
.env
```

Update these values:

```dotenv
APP_URL=http://solar-guide-site.test
DB_DATABASE=solar_guide_site
DB_USERNAME=root
DB_PASSWORD=
```

If the site will mainly be opened from other computers by IP address, use the second computer IP instead:

```dotenv
APP_URL=http://SECOND-COMPUTER-IP
```

Update mail values only if mail should send from the second computer. The default `MAIL_MAILER=log` is safe for local installs because it writes emails to Laravel logs instead of sending them.

Do not copy the development machine `.env` directly. Generate a fresh `APP_KEY` on the second computer in step 6.

## 5. Import The Database

The package database dump should be here:

```text
database\solar-guide-site.sql
```

Use an empty database before importing.

From Command Prompt or Laragon terminal:

```cmd
mysql -u root -p solar_guide_site < C:\path\to\package\database\solar-guide-site.sql
```

If root has no password:

```cmd
mysql -u root solar_guide_site < C:\path\to\package\database\solar-guide-site.sql
```

PowerShell does not handle `<` the same way as Command Prompt. If you are in PowerShell, use `cmd /c`:

```powershell
cmd /c "mysql -u root -p solar_guide_site < C:\path\to\package\database\solar-guide-site.sql"
```

If the dump was not included, you can still install a fresh database by running the migrations in step 6. That creates the tables, but it will not restore existing posts, pages, users, leads, settings, uploads metadata, or chat history.

## 6. Run The Setup Commands

Open Laragon terminal in:

```text
C:\laragon\www\solar-guide-site
```

Run:

```powershell
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
```

If the package already includes the `vendor` folder and the second computer has no internet, use this instead of `composer install`:

```powershell
composer dump-autoload --optimize
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
```

If a copied development hot-reload file exists, remove it on the second computer:

```powershell
Remove-Item public\hot -ErrorAction SilentlyContinue
```

If you need to rebuild frontend assets on the second computer:

```powershell
npm install
npm run build
```

Usually this package already includes `public\build`, so rebuilding is optional.

## 7. Create The Laragon Site

The web server document root must point to:

```text
C:\laragon\www\solar-guide-site\public
```

If Laragon auto-creates the local domain, it will usually be:

```text
http://solar-guide-site.test
```

If the auto-created site does not point to `public`, create or update the Apache virtual host:

```apache
<VirtualHost *:80>
    ServerName solar-guide-site.test
    DocumentRoot "C:/laragon/www/solar-guide-site/public"

    <Directory "C:/laragon/www/solar-guide-site/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Restart Apache after changing virtual hosts.

## 8. Make It Reachable On The Network

If other computers on the same network should open it:

1. Find the second computer IP address.
2. Allow Apache or Nginx through Windows Firewall.
3. Open the site from another computer:

```text
http://SECOND-COMPUTER-IP/
```

If the site needs to use the `.test` domain from other computers, add a hosts file entry on each client computer:

```text
SECOND-COMPUTER-IP solar-guide-site.test
```

Then set:

```dotenv
APP_URL=http://solar-guide-site.test
```

Run this after changing `.env`:

```powershell
php artisan optimize:clear
```

## 9. Verify The Install

Open:

```text
http://solar-guide-site.test
```

or:

```text
http://SECOND-COMPUTER-IP/
```

Check:

- The home page loads.
- Images and uploaded files load.
- `/login` opens.
- An admin user from the imported database can sign in.
- `/dashboard` opens after signing in.
- `/admin/settings` opens after signing in.

If you installed without a database dump, create the first user at:

```text
/register
```

## Troubleshooting

### 500 Error Or Blank Page

Run:

```powershell
php artisan optimize:clear
```

Then check:

```text
storage\logs\laravel.log
```

Common causes are missing `.env`, missing `APP_KEY`, incorrect database credentials, or missing Composer dependencies.

### Vite Or Asset Errors

Make sure this folder exists:

```text
public\build
```

If it does not exist, run:

```powershell
npm install
npm run build
```

If the browser is trying to load assets from a development server such as `localhost:5173`, remove:

```text
public\hot
```

Then run:

```powershell
php artisan optimize:clear
```

### Images Or Uploads Do Not Load

Run:

```powershell
php artisan storage:link
```

If Laravel says the link already exists but files still do not load, delete the copied `public\storage` link or folder on the second computer and run `php artisan storage:link` again.

### Database Login Fails

Confirm `.env` matches the Laragon MySQL settings:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=solar_guide_site
DB_USERNAME=root
DB_PASSWORD=
```

If Laragon uses a different MySQL port, update `DB_PORT`.

After editing `.env`, run:

```powershell
php artisan optimize:clear
```

### Import Command Fails In PowerShell

Use Command Prompt/Laragon terminal, or wrap the import with `cmd /c`:

```powershell
cmd /c "mysql -u root -p solar_guide_site < C:\path\to\package\database\solar-guide-site.sql"
```

### Other Computers Cannot Open The Site

Check:

- Apache or Nginx is running in Laragon.
- Windows Firewall allows Apache or Nginx on private networks.
- The second computer and client computer are on the same network.
- `APP_URL` matches the URL users are opening.
- The client is using `http://SECOND-COMPUTER-IP/` or has a hosts file entry for `solar-guide-site.test`.

## Important Notes

- This deployment is separate from the current development machine.
- The package should not copy the current `.env` file directly.
- Set a fresh `.env` and generate a fresh `APP_KEY` on the second computer.
- Uploads and public storage files should be included in the package copy.
- The database dump is required if you want to preserve current content, settings, users, leads, comments, analytics, chat, and backup records.
- If mail, backups, captcha, AdSense, chat, or other integrations need different settings on the second computer, update them there only.
