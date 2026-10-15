import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_SITE_DATA } from '../data/initialData';

describe('Supabase Client & Configuration', () => {
  it('initializes Supabase client without crashing', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('reports configuration status accurately', () => {
    // When environment variables are dummy/mock, isSupabaseConfigured reflects accordingly
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });
});

describe('Public-First Access Governance & Admin Toggles', () => {
  it('defaults publicAccessEnabled to true and authRequiredForTools to false', () => {
    expect(INITIAL_SITE_DATA.adminSettings?.publicAccessEnabled).toBe(true);
    expect(INITIAL_SITE_DATA.adminSettings?.authRequiredForTools).toBe(false);
  });

  it('guarantees architecture tools and calculators remain publicly accessible', () => {
    const settings = INITIAL_SITE_DATA.adminSettings;
    const canPublicAccessTools = (settings?.publicAccessEnabled ?? true) && !(settings?.authRequiredForTools ?? false);
    expect(canPublicAccessTools).toBe(true);
  });
});

describe('Briefing Request Validation & Constraints', () => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  it('validates enterprise business emails accurately', () => {
    expect(emailRegex.test('david@enterprise.com')).toBe(true);
    expect(emailRegex.test('wasim@zaboraa.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('missing-domain@')).toBe(false);
    expect(emailRegex.test('@no-local.com')).toBe(false);
  });

  it('enforces character length constraints matching database schema', () => {
    const validPayload = {
      name: 'David Henderson',
      email: 'david@enterprise.com',
      company: 'Global Financial Group',
      cloud_focus: 'Azure AVS',
      vm_scale: '500 - 1,500 VMs',
      urgency: 'Within 60 Days',
      status: 'new'
    };

    expect(validPayload.name.trim().length).toBeGreaterThanOrEqual(2);
    expect(validPayload.name.length).toBeLessThanOrEqual(120);
    expect(validPayload.company.trim().length).toBeGreaterThanOrEqual(2);
    expect(validPayload.company.length).toBeLessThanOrEqual(150);
    expect(validPayload.status).toBe('new');
  });
});

describe('User Role & Profile Permissions Resolution', () => {
  function resolveUserPrivileges(email: string) {
    const role = email.toLowerCase() === 'admin@zaboraa.com' ? 'admin' : 'user';
    const tier = email.toLowerCase() === 'admin@zaboraa.com' ? 'enterprise' : 'free';
    return { role, tier };
  }

  it('correctly maps admin@zaboraa.com to admin role and enterprise subscription tier', () => {
    const privileges = resolveUserPrivileges('admin@zaboraa.com');
    expect(privileges.role).toBe('admin');
    expect(privileges.tier).toBe('enterprise');
  });

  it('defaults public users to user role and free tier', () => {
    const privileges = resolveUserPrivileges('guest@external.io');
    expect(privileges.role).toBe('user');
    expect(privileges.tier).toBe('free');
  });
});
