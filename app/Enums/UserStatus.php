<?php

namespace App\Enums;

/**
 * Represents the possible states of a user account.
 *
 * - Active: Normal access, can authenticate and use the application.
 * - Inactive: Account exists but cannot authenticate. Used for deprovisioned accounts.
 * - Suspended: Temporarily restricted. Used for policy violations or security holds.
 */
enum UserStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';

    /**
     * Get the human-readable label for this status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Inactive => 'Inactive',
            self::Suspended => 'Suspended',
        };
    }

    /**
     * Check if the user with this status is allowed to authenticate.
     */
    public function canAuthenticate(): bool
    {
        return $this === self::Active;
    }
}
