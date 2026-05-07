<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminBackupController;
use App\Http\Controllers\AdminChatController;
use App\Http\Controllers\AdminGuideController;
use App\Http\Controllers\AdminCommentController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\AdminMenuController;
use App\Http\Controllers\AdminPageController;
use App\Http\Controllers\AdminSettingController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AnalyticsEventController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\GuideCommentController;
use App\Http\Controllers\PublicChatController;
use App\Http\Controllers\PublicLeadController;
use App\Http\Controllers\SitePageController;
use App\Http\Controllers\SitemapController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('/', [GuideController::class, 'home'])->name('home');
Route::get('/pages/{page:slug}', [SitePageController::class, 'show'])->name('pages.show');

Route::get('/guides', [GuideController::class, 'index'])->name('guides.index');
Route::get('/guides/category/{category:slug}', [GuideController::class, 'category'])->name('guides.category');
Route::get('/guides/{post:slug}', [GuideController::class, 'show'])->name('guides.show');
Route::post('/guides/{post:slug}/comments', [GuideCommentController::class, 'store'])->name('guides.comments.store');
Route::post('/solar-calculator', [PublicLeadController::class, 'storeCalculator'])->name('leads.calculator.store');
Route::post('/contact-enquiry', [PublicLeadController::class, 'storeContact'])->name('leads.contact.store');
Route::post('/subscribe', [PublicLeadController::class, 'storeSubscribe'])->name('leads.subscribe.store');
Route::post('/chat/start', [PublicChatController::class, 'start'])->name('chat.start');
Route::get('/chat/messages', [PublicChatController::class, 'messages'])->name('chat.messages');
Route::post('/chat/messages', [PublicChatController::class, 'store'])->name('chat.messages.store');
Route::post('/chat/typing', [PublicChatController::class, 'typing'])->name('chat.typing');
Route::post('/analytics/events', [AnalyticsEventController::class, 'store'])
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('analytics.events.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('/admin/posts', [AdminGuideController::class, 'index'])->name('admin.posts.index');
    Route::get('/admin/posts/create', [AdminGuideController::class, 'create'])->name('admin.posts.create');
    Route::post('/admin/posts', [AdminGuideController::class, 'store'])->name('admin.posts.store');
    Route::get('/admin/posts/{post}/edit', [AdminGuideController::class, 'edit'])->name('admin.posts.edit');
    Route::put('/admin/posts/{post}', [AdminGuideController::class, 'update'])->name('admin.posts.update');
    Route::delete('/admin/posts/{post}', [AdminGuideController::class, 'destroy'])->name('admin.posts.destroy');
    Route::post('/admin/posts/editor-image', [AdminGuideController::class, 'uploadEditorImage'])->name('admin.posts.editor-image');
    Route::get('/admin/pages', [AdminPageController::class, 'index'])->name('admin.pages.index');
    Route::get('/admin/pages/create', [AdminPageController::class, 'create'])->name('admin.pages.create');
    Route::post('/admin/pages', [AdminPageController::class, 'store'])->name('admin.pages.store');
    Route::get('/admin/pages/{page}/edit', [AdminPageController::class, 'edit'])->name('admin.pages.edit');
    Route::put('/admin/pages/{page}', [AdminPageController::class, 'update'])->name('admin.pages.update');
    Route::delete('/admin/pages/{page}', [AdminPageController::class, 'destroy'])->name('admin.pages.destroy');
    Route::get('/admin/pages/{page}/preview', [AdminPageController::class, 'preview'])->name('admin.pages.preview');
    Route::get('/admin/pages/{page}/builder', fn ($page) => redirect()->route('admin.pages.edit', $page))->name('admin.pages.builder');

    Route::get('/admin/categories', [AdminGuideController::class, 'categories'])->name('admin.categories.index');
    Route::post('/admin/categories', [AdminGuideController::class, 'storeCategory'])->name('admin.categories.store');
    Route::put('/admin/categories/{category}', [AdminGuideController::class, 'updateCategory'])->name('admin.categories.update');
    Route::delete('/admin/categories/{category}', [AdminGuideController::class, 'destroyCategory'])->name('admin.categories.destroy');

    Route::get('/admin/menus', [AdminMenuController::class, 'index'])->name('admin.menus.index');
    Route::post('/admin/menus', [AdminMenuController::class, 'store'])->name('admin.menus.store');
    Route::put('/admin/menus/{menu}', [AdminMenuController::class, 'update'])->name('admin.menus.update');
    Route::delete('/admin/menus/{menu}', [AdminMenuController::class, 'destroy'])->name('admin.menus.destroy');
    Route::post('/admin/menus/reorder', [AdminMenuController::class, 'reorder'])->name('admin.menus.reorder');
    Route::get('/admin/menus/options', [AdminMenuController::class, 'getOptions'])->name('admin.menus.options');

    Route::get('/admin/comments', [AdminCommentController::class, 'index'])->name('admin.comments.index');
    Route::put('/admin/comments/{comment}', [AdminCommentController::class, 'update'])->name('admin.comments.update');
    Route::delete('/admin/comments/{comment}', [AdminCommentController::class, 'destroy'])->name('admin.comments.destroy');

    Route::get('/admin/analytics', [AdminAnalyticsController::class, 'index'])->name('admin.analytics.index');
    Route::get('/admin/leads', [PublicLeadController::class, 'index'])->name('admin.leads.index');
    Route::get('/admin/leads/export/{format}', [PublicLeadController::class, 'export'])->name('admin.leads.export');
    Route::get('/admin/chats', [AdminChatController::class, 'index'])->name('admin.chats.index');
    Route::get('/admin/chats/data', [AdminChatController::class, 'data'])->name('admin.chats.data');
    Route::post('/admin/chats/{conversation}/reply', [AdminChatController::class, 'reply'])->name('admin.chats.reply');
    Route::post('/admin/chats/{conversation}/reply-json', [AdminChatController::class, 'replyJson'])->name('admin.chats.reply-json');
    Route::post('/admin/chats/{conversation}/typing', [AdminChatController::class, 'typing'])->name('admin.chats.typing');
    Route::patch('/admin/chats/{conversation}/close', [AdminChatController::class, 'close'])->name('admin.chats.close');
    Route::patch('/admin/chats/{conversation}/open', [AdminChatController::class, 'open'])->name('admin.chats.open');
    Route::patch('/admin/chats/{conversation}/complete', [AdminChatController::class, 'complete'])->name('admin.chats.complete');
    Route::delete('/admin/chats/{conversation}', [AdminChatController::class, 'destroy'])->name('admin.chats.destroy');
    Route::get('/admin/backups', [AdminBackupController::class, 'index'])->name('admin.backups.index');
    Route::post('/admin/backups', [AdminBackupController::class, 'store'])->name('admin.backups.store');
    Route::get('/admin/backups/{backup}/download', [AdminBackupController::class, 'download'])->name('admin.backups.download');
    Route::post('/admin/backups/{backup}/restore', [AdminBackupController::class, 'restore'])->name('admin.backups.restore');
    Route::delete('/admin/backups/{backup}', [AdminBackupController::class, 'destroy'])->name('admin.backups.destroy');

    Route::get('/admin/settings', [AdminSettingController::class, 'edit'])->name('admin.settings.edit');
    Route::post('/admin/settings', [AdminSettingController::class, 'updateGeneral'])->name('admin.settings.update');
    Route::get('/admin/settings/general', [AdminSettingController::class, 'general'])->name('admin.settings.general');
    Route::post('/admin/settings/general', [AdminSettingController::class, 'updateGeneral'])->name('admin.settings.general.update');
    Route::get('/admin/settings/seo', [AdminSettingController::class, 'seo'])->name('admin.settings.seo');
    Route::post('/admin/settings/seo', [AdminSettingController::class, 'updateSeo'])->name('admin.settings.seo.update');
    Route::get('/admin/settings/adsense', [AdminSettingController::class, 'adsense'])->name('admin.settings.adsense');
    Route::post('/admin/settings/adsense', [AdminSettingController::class, 'updateAdsense'])->name('admin.settings.adsense.update');
    Route::get('/admin/settings/mail', [AdminSettingController::class, 'mail'])->name('admin.settings.mail');
    Route::post('/admin/settings/mail', [AdminSettingController::class, 'updateMail'])->name('admin.settings.mail.update');
    Route::post('/admin/settings/mail/test', [AdminSettingController::class, 'testMail'])->name('admin.settings.mail.test');
    Route::get('/admin/settings/menus', [AdminSettingController::class, 'menus'])->name('admin.settings.menus');
    Route::post('/admin/settings/menus', [AdminSettingController::class, 'updateMenus'])->name('admin.settings.menus.update');
    Route::get('/admin/settings/footer', [AdminSettingController::class, 'footer'])->name('admin.settings.footer');
    Route::post('/admin/settings/footer', [AdminSettingController::class, 'updateFooter'])->name('admin.settings.footer.update');
    Route::get('/admin/settings/captcha', [AdminSettingController::class, 'captcha'])->name('admin.settings.captcha');
    Route::post('/admin/settings/captcha', [AdminSettingController::class, 'updateCaptcha'])->name('admin.settings.captcha.update');
    Route::get('/admin/settings/deleted-content', [AdminSettingController::class, 'deletedContent'])->name('admin.settings.deleted-content');
    Route::get('/admin/settings/backups', [AdminBackupController::class, 'index'])->name('admin.settings.backups');
    Route::post('/admin/settings/backups', [AdminBackupController::class, 'store'])->name('admin.settings.backups.store');
    Route::get('/admin/settings/backups/{backup}/download', [AdminBackupController::class, 'download'])->name('admin.settings.backups.download');
    Route::post('/admin/settings/backups/{backup}/restore', [AdminBackupController::class, 'restore'])->name('admin.settings.backups.restore');
    Route::delete('/admin/settings/backups/{backup}', [AdminBackupController::class, 'destroy'])->name('admin.settings.backups.destroy');

    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::get('/admin/users/create', [AdminUserController::class, 'create'])->name('admin.users.create');
    Route::post('/admin/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::get('/admin/users/{user}/edit', [AdminUserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
