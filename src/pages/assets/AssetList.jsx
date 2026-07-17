import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Boxes, MapPin, User2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAssets } from "@/features/assets/assetSlice";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Input, Select } from "@/components/common/Field";
import { AssetStatusBadge } from "@/components/common/Badge";
import { Loader, ErrorState, EmptyState } from "@/components/common/Feedback";
import AssetFormModal from "./AssetFormModal";

const STATUSES = [
  "Operational",
  "Issue Reported",
  "Under Inspection",
  "Under Maintenance",
  "Out of Service",
  "Retired",
];

export default function AssetList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { list, status, error } = useAppSelector((s) => s.assets);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return list.filter((a) => {
      const matchesSearch =
        !search ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.assetCode?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [list, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
            Assets
          </h2>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {list.length} registered asset{list.length === 1 ? "" : "s"}
          </p>
        </div>
        {role === "admin" && (
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Register asset
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]" />
          <Input
            placeholder="Search by name or asset code…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-56"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {status === "loading" && !list.length ? (
        <Loader label="Loading assets…" />
      ) : status === "failed" && !list.length ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchAssets())} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No assets found"
          description={
            list.length === 0
              ? "Register your first asset to generate its QR code and public page."
              : "Try adjusting your search or filters."
          }
          action={
            role === "admin" &&
            list.length === 0 && (
              <Button icon={Plus} onClick={() => setCreateOpen(true)}>
                Register asset
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset, i) => (
            <Card
              key={asset._id}
              tag
              className="animate-fade-in-up cursor-pointer p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              onClick={() => navigate(`/app/assets/${asset._id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
                    {asset.name}
                  </p>
                  <p className="font-[var(--font-mono)] text-xs text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                    {asset.assetCode}
                  </p>
                </div>
                <AssetStatusBadge status={asset.status} />
              </div>

              <div className="tag-perforation my-3" />

              <div className="space-y-1.5 text-sm text-[var(--color-ink-soft)]">
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" /> {asset.location}
                </p>
                <p className="flex items-center gap-1.5">
                  <Boxes className="size-3.5 shrink-0" /> {asset.category} · {asset.condition}
                </p>
                {asset.assignedTechnician?._id && (
                  <p className="flex items-center gap-1.5">
                    <User2 className="size-3.5 shrink-0" />{" "}
                    {asset.assignedTechnician.userName ||
                      asset.assignedTechnician.name ||
                      asset.assignedTechnician.email}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {role === "admin" && (
        <AssetFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
    </div>
  );
}
