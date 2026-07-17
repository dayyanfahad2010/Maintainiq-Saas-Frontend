import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createAsset, updateAsset, fetchAssetById } from "@/features/assets/assetSlice";
import { fetchTechnicians } from "@/features/users/userSlice";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { FormField, Input, Select } from "@/components/common/Field";
import { toDateInputValue } from "@/utils/format";

const CATEGORIES = [
  "Electrical",
  "HVAC",
  "IT Equipment",
  "Furniture",
  "Plumbing",
  "Safety Equipment",
  "Vehicle",
  "Machinery",
  "Other",
];

export default function AssetFormModal({ open, onClose, asset }) {
  const dispatch = useAppDispatch();
  const actionStatus = useAppSelector((s) => s.assets.actionStatus);
  const technicians = useAppSelector((s) => s.users.technicians);
  const isEdit = Boolean(asset);

  useEffect(() => {
    if (open) dispatch(fetchTechnicians());
  }, [open, dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      assetCode: "",
      category: "",
      location: "",
      condition: "Good",
      assignedTechnician: "",
      lastServiceDate: "",
      nextServiceDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: asset?.name || "",
        assetCode: asset?.assetCode || "",
        category: asset?.category || "",
        location: asset?.location || "",
        condition: asset?.condition || "Good",
        assignedTechnician: asset?.assignedTechnician?._id || asset?.assignedTechnician || "",
        lastServiceDate: toDateInputValue(asset?.lastServiceDate),
        nextServiceDate: toDateInputValue(asset?.nextServiceDate),
      });
    }
  }, [open, asset, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values };
    if (!payload.assignedTechnician) delete payload.assignedTechnician;
    if (!payload.lastServiceDate) delete payload.lastServiceDate;
    if (!payload.nextServiceDate) delete payload.nextServiceDate;

    if (isEdit) {
      const result = await dispatch(updateAsset({ id: asset._id, payload }));
      if (updateAsset.fulfilled.match(result)) {
        toast.success("Asset updated");
        dispatch(fetchAssetById(asset._id)); // backend update response omits the record — re-fetch to be safe
        onClose();
      } else {
        toast.error(result.payload || "Couldn't update asset");
      }
    } else {
      const assetCode = values.assetCode.trim();
      const publicUrl = `${window.location.origin}/scan/${assetCode}`;
      const result = await dispatch(
        createAsset({ ...payload, assetCode, publicUrl, qrCode: publicUrl })
      );
      if (createAsset.fulfilled.match(result)) {
        toast.success("Asset registered");
        onClose();
      } else {
        toast.error(result.payload || "Couldn't create asset");
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit asset" : "Register new asset"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Asset name" htmlFor="name" required error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Classroom Projector 01"
              error={!!errors.name}
              {...register("name", { required: "Name is required" })}
            />
          </FormField>

          <FormField
            label="Asset code"
            htmlFor="assetCode"
            required
            error={errors.assetCode?.message}
            hint={isEdit ? "Codes cannot be changed after creation." : "Must be unique — e.g. PROJ-01."}
          >
            <Input
              id="assetCode"
              placeholder="PROJ-01"
              disabled={isEdit}
              error={!!errors.assetCode}
              {...register("assetCode", { required: "Asset code is required" })}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
            <Select id="category" error={!!errors.category} {...register("category", { required: "Category is required" })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Location" htmlFor="location" required error={errors.location?.message}>
            <Input
              id="location"
              placeholder="Building A, Room 204"
              error={!!errors.location}
              {...register("location", { required: "Location is required" })}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Condition" htmlFor="condition">
            <Select id="condition" {...register("condition")}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </Select>
          </FormField>

          <FormField
            label="Assigned technician"
            htmlFor="assignedTechnician"
            hint="Optional."
          >
            <Select id="assignedTechnician" {...register("assignedTechnician")}>
              <option value="">Unassigned</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userName || t.email}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Last service date" htmlFor="lastServiceDate">
            <Input id="lastServiceDate" type="date" {...register("lastServiceDate")} />
          </FormField>
          <FormField label="Next service date" htmlFor="nextServiceDate">
            <Input id="nextServiceDate" type="date" {...register("nextServiceDate")} />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={actionStatus === "loading"}>
            {isEdit ? "Save changes" : "Register asset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
