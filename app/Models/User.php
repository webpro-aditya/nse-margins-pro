<?php

namespace App\Models;

use App\Enums\UserStatus;
use App\Notifications\Auth\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User model — the core identity in the application.
 *
 * Designed for future extensibility:
 * - SoftDeletes: Enterprise apps never hard-delete users.
 * - Status enum: Gates access without removing the record.
 * - Relationship stubs: Ready for Roles, Permissions, Profile, etc.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property UserStatus $status
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property string|null $last_login_ip
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
#[Fillable(['name', 'email', 'password', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Send the password reset notification.
     *
     * Overrides the default to use our custom branded notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    // -------------------------------------------------------------------------
    // Relationship stubs — uncomment and implement as modules are built
    // -------------------------------------------------------------------------

    // public function roles(): BelongsToMany
    // {
    //     return $this->belongsToMany(Role::class);
    // }

    // public function permissions(): BelongsToMany
    // {
    //     return $this->belongsToMany(Permission::class);
    // }

    // public function profile(): HasOne
    // {
    //     return $this->hasOne(Profile::class);
    // }

    // public function organization(): BelongsTo
    // {
    //     return $this->belongsTo(Organization::class);
    // }

    // public function team(): BelongsTo
    // {
    //     return $this->belongsTo(Team::class);
    // }

    // public function activityLogs(): HasMany
    // {
    //     return $this->hasMany(ActivityLog::class);
    // }
}
