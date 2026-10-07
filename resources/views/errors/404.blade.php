<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found | NSE Margins Pro (V2)</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap" rel="stylesheet" />

    <style>
        :root {
            --background: #090d16;
            --foreground: #f8fafc;
            --muted: #1e293b;
            --muted-foreground: #94a3b8;
            --border: rgba(255, 255, 255, 0.08);
            --primary: #3b82f6;
            --primary-foreground: #ffffff;
            --card: rgba(15, 23, 42, 0.6);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            position: relative;
        }

        /* Subtle grid pattern */
        .bg-grid {
            position: absolute;
            inset: 0;
            opacity: 0.03;
            pointer-events: none;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 64px 64px;
        }

        /* Ambient glow */
        .glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 480px;
            height: 480px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
            pointer-events: none;
            border-radius: 9999px;
            filter: blur(40px);
        }

        /* Header */
        header {
            position: relative;
            z-index: 50;
            height: 64px;
            border-bottom: 1px solid var(--border);
            background: rgba(9, 13, 22, 0.7);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
        }

        .logo-wrap {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: inherit;
        }

        .brand-text {
            font-weight: 800;
            font-size: 1.125rem;
            letter-spacing: -0.025em;
            background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .v2-badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
            text-transform: uppercase;
        }

        /* Main Container */
        main {
            position: relative;
            z-index: 10;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2.5rem 1.5rem;
        }

        .error-card {
            width: 100%;
            max-width: 680px;
            text-align: center;
        }

        .num-404 {
            font-size: 8rem;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -0.05em;
            background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 60%, rgba(148, 163, 184, 0.1) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            user-select: none;
        }

        .badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: -1rem;
            backdrop-filter: blur(8px);
        }

        h1 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-top: 1.25rem;
            color: #f8fafc;
        }

        p.desc {
            color: var(--muted-foreground);
            font-size: 0.95rem;
            max-width: 480px;
            margin: 0.75rem auto 1.5rem auto;
            line-height: 1.5;
        }

        .url-box {
            display: inline-block;
            padding: 0.35rem 0.85rem;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.8rem;
            color: #94a3b8;
            margin-bottom: 2rem;
            max-width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 2.5rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-primary {
            background-color: var(--primary);
            color: var(--primary-foreground);
            border: 1px solid transparent;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
        }

        .btn-outline {
            background: rgba(15, 23, 42, 0.6);
            color: #f8fafc;
            border: 1px solid var(--border);
        }

        .btn-outline:hover {
            background: rgba(30, 41, 59, 0.8);
            border-color: rgba(255, 255, 255, 0.2);
        }

        /* Segments Grid */
        .segments-section {
            border-top: 1px solid var(--border);
            padding-top: 2rem;
        }

        .segments-title {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted-foreground);
            margin-bottom: 1rem;
        }

        .segments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 0.75rem;
            text-align: left;
        }

        .seg-card {
            padding: 1rem;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            display: block;
        }

        .seg-card:hover {
            background: rgba(30, 41, 59, 0.7);
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-2px);
        }

        .seg-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .seg-desc {
            font-size: 0.75rem;
            color: var(--muted-foreground);
            margin-top: 0.25rem;
        }

        footer {
            position: relative;
            z-index: 10;
            border-top: 1px solid var(--border);
            padding: 1.25rem;
            text-align: center;
            font-size: 0.8rem;
            color: var(--muted-foreground);
            background: rgba(9, 13, 22, 0.5);
        }
    </style>
</head>
<body>
    <div class="bg-grid"></div>
    <div class="glow"></div>

    <header>
        <a href="/v2/dashboard" class="logo-wrap">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="#3b82f6" stroke-width="12" stroke-dasharray="190 70" stroke-linecap="round" />
                <circle cx="50" cy="50" r="26" fill="#1e3a8a" />
            </svg>
            <span class="brand-text">NSE Margins Pro</span>
            <span class="v2-badge">V2 Theme</span>
        </a>
        <a href="/v2/dashboard" class="btn btn-outline" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
            Dashboard
        </a>
    </header>

    <main>
        <div class="error-card">
            <div class="num-404">404</div>
            <div>
                <span class="badge-pill">● Page Not Found</span>
            </div>

            <h1>Lost in Margin Orbit?</h1>
            <p class="desc">
                The requested URL or segment does not exist or has been relocated. Check the address or navigate to one of the active margin segments below.
            </p>

            <div class="url-box">
                {{ request()->path() }}
            </div>

            <div class="actions">
                <a href="javascript:history.back()" class="btn btn-outline">
                    ← Go Back
                </a>
                <a href="/v2/dashboard" class="btn btn-primary">
                    Return to V2 Dashboard
                </a>
            </div>

            <div class="segments-section">
                <div class="segments-title">Active Margin Segments</div>
                <div class="segments-grid">
                    <a href="/v2/margins/cm" class="seg-card">
                        <div class="seg-name">
                            <span>CM Margins</span>
                            <span style="font-size: 0.65rem; color: #60a5fa;">CASH</span>
                        </div>
                        <div class="seg-desc">Capital Market upfront, settlement & securities</div>
                    </a>
                    <a href="/v2/margins/fo" class="seg-card">
                        <div class="seg-name">
                            <span>FO Margins</span>
                            <span style="font-size: 0.65rem; color: #c084fc;">F&O</span>
                        </div>
                        <div class="seg-desc">Futures & Options proprietary & client margins</div>
                    </a>
                    <a href="/v2/margins/cd" class="seg-card">
                        <div class="seg-name">
                            <span>CD Margins</span>
                            <span style="font-size: 0.65rem; color: #facc15;">FX</span>
                        </div>
                        <div class="seg-desc">Currency Derivatives margins & utilization</div>
                    </a>
                    <a href="/v2/margins/co" class="seg-card">
                        <div class="seg-name">
                            <span>CO Margins</span>
                            <span style="font-size: 0.65rem; color: #34d399;">COMM</span>
                        </div>
                        <div class="seg-desc">Commodities settlement & upfront margins</div>
                    </a>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>© {{ date('Y') }} NSE Margins Pro (V2). All rights reserved.</p>
    </footer>
</body>
</html>
