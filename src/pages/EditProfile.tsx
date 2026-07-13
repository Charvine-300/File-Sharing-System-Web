import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { updateProfile } from "../app/features/authSlice";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";
import type { UpdateProfileRequest } from "../types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const { firstName, lastName, email, profileImageUrl, loading } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileRequest>({
    defaultValues: {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
    },
  });

  async function onSubmit(data: UpdateProfileRequest) {
    await dispatch(updateProfile(data));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-md p-8">
      <h1>Edit profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update the details on your account
      </p>

      <div className="mb-6 flex items-center gap-4">
        <Avatar
          src={profileImageUrl}
          firstName={firstName}
          lastName={lastName}
        />
        <button
          type="button"
          disabled
          className="cursor-not-allowed text-sm text-muted-foreground"
        >
          Change photo (coming soon)
        </button>
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          className="input"
          {...register("firstName", { required: "First name is required" })}
        />
        {errors.firstName && (
          <p className="text-xs text-danger">{errors.firstName.message}</p>
        )}
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="lastName">
          Last name
        </label>
        <input
          id="lastName"
          className="input"
          {...register("lastName", { required: "Last name is required" })}
        />
        {errors.lastName && (
          <p className="text-xs text-danger">{errors.lastName.message}</p>
        )}
      </div>

      <div className="input-field-group">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input"
          {...register("email", {
            required: "Email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          })}
        />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        className="btn primary-btn normal-btn inline-flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && <Spinner size="sm" variant="on-primary" />}
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
