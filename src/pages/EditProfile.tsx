import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchCurrentUser, updateProfile } from "../app/features/authSlice";
import ProfilePhotoInput from "../components/ProfilePhotoInput";
import Spinner from "../components/Spinner";
import type { UpdateProfileRequest } from "../types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const { firstName, lastName, email, profileImageUrl, loading } = useAppSelector(
    (state) => state.auth
  );

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    defaultValues: {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
    },
  });

  // Refresh from the server on mount so the form reflects more than just
  // what login returned (login doesn't include email, for instance).
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    reset({
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
    });
  }, [firstName, lastName, email, reset]);

  async function onSubmit(data: EditProfileFormValues) {
    const payload: UpdateProfileRequest = { ...data };
    if (profilePhoto) payload.profilePhoto = profilePhoto;
    await dispatch(updateProfile(payload));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-md p-8">
      <h1>Edit profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update the details on your account
      </p>

      <ProfilePhotoInput
        value={profilePhoto}
        onChange={setProfilePhoto}
        currentPhotoUrl={profileImageUrl}
        firstName={firstName}
        lastName={lastName}
      />

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
