import sys, asyncio
sys.path.insert(0, '.')

async def create_admin():
    import httpx
    base = 'http://localhost:8000'
    async with httpx.AsyncClient(base_url=base, timeout=30) as c:
        r = await c.post('/api/auth/register', json={
            'email': 'admin@beyondproof.dev',
            'password': 'AdminBP2024!',
            'full_name': 'Admin User',
            'role': 'admin'
        })
        data = r.json()
        user = data.get('user', {})
        print(f"Admin created: role={user.get('role')}, email={user.get('email')}")

asyncio.run(create_admin())
