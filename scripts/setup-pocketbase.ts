import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';

dotenv.config();

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

async function setup() {
    if (!adminEmail || !adminPassword) {
        console.error('POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set');
        process.exit(1);
    }

    const pb = new PocketBase(pbUrl);

    try {
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Authenticated as admin');

        const collections = [
            {
                name: 'user_rate_limits',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
                    { name: 'usage_count', type: 'number' },
                    { name: 'reset_date', type: 'date' },
                    { name: 'last_request_at', type: 'date' },
                ],
            },
            {
                name: 'research_tasks',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
                    { name: 'deepresearch_id', type: 'text', required: true, unique: true },
                    { name: 'location_name', type: 'text' },
                    { name: 'location_lat', type: 'number' },
                    { name: 'location_lng', type: 'number' },
                    { name: 'status', type: 'select', options: { values: ['queued', 'running', 'completed', 'failed'] } },
                    { name: 'session_id', type: 'text' },
                    { name: 'anonymous_id', type: 'text' },
                    { name: 'is_public', type: 'bool' },
                    { name: 'share_token', type: 'text', unique: true },
                    { name: 'location_images', type: 'json' },
                    { name: 'completed_at', type: 'date' },
                ],
            },
            {
                name: 'chat_sessions',
                type: 'base',
                schema: [
                    { name: 'user', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
                    { name: 'title', type: 'text' },
                    { name: 'last_message_at', type: 'date' },
                ],
            },
            {
                name: 'chat_messages',
                type: 'base',
                schema: [
                    { name: 'session_id', type: 'text', required: true },
                    { name: 'role', type: 'text', required: true },
                    { name: 'content', type: 'json', required: true },
                    { name: 'processing_time_ms', type: 'number' },
                ],
            },
        ];

        for (const coll of collections) {
            try {
                await pb.collections.create(coll);
                console.log(`Created collection: ${coll.name}`);
            } catch (e: any) {
                if (e.status === 400 && e.data?.data?.name?.code === 'validation_not_unique') {
                    console.log(`Collection ${coll.name} already exists, updating...`);
                    const existing = await pb.collections.getOne(coll.name);
                    await pb.collections.update(existing.id, coll);
                } else {
                    console.error(`Error creating collection ${coll.name}:`, e.data);
                }
            }
        }

        console.log('PocketBase setup complete!');
    } catch (e: any) {
        console.error('Setup failed:', e.data || e.message);
    }
}

setup();
