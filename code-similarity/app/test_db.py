from prisma import Prisma
import asyncio

async def main() -> None:
    db = Prisma()
    await db.connect()

    problem = await db.problem.create(
        {
            'text': 'Hello from prisma!',
            'language': 'Prisma is a database toolkit and makes databases easy.',
            'constraints': 'hi'
        }
    )

    await db.disconnect()


if __name__ == '__main__':
    asyncio.run(main())