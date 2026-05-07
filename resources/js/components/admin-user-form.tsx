import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFormState {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export function AdminUserForm({
    form,
    setForm,
    passwordRequired = true,
}: {
    form: UserFormState;
    setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
    passwordRequired?: boolean;
}) {
    return (
        <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Jane Solar"
                        required
                        className="h-12 rounded-2xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="jane@example.com"
                        required
                        className="h-12 rounded-2xl"
                    />
                </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="password">{passwordRequired ? 'Password' : 'New password'}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder={passwordRequired ? 'Create a strong password' : 'Leave blank to keep current password'}
                        required={passwordRequired}
                        className="h-12 rounded-2xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                        placeholder="Repeat the password"
                        required={passwordRequired}
                        className="h-12 rounded-2xl"
                    />
                </div>
            </div>
        </div>
    );
}
