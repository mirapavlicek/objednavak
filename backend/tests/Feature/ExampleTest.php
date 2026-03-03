<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_spa_fallback_redirects_or_serves(): void
    {
        $response = $this->get('/');

        // In test env, app.html doesn't exist, so we get 302 redirect to Vite
        $response->assertStatus(302);
    }
}
