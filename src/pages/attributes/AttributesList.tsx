import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deleteAttribute, getAttributes } from "../../app/features/attributeMgmtSlice";
import { useCan } from "../../hooks/usePermission";
import { useListLoadingState } from "../../hooks/useListLoadingState";
import { humanize } from "../../utils/format";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import FilterBar, { type ActiveFilter, type FilterFieldDef } from "../../components/FilterBar";
import { ATTRIBUTE_TYPES } from "../../types/attributeMgmt";
import type {
  AllAttributesResponse,
  AttributeParameters,
} from "../../types/attributeMgmt";
import AttributeRowActions from "./components/AttributeRowActions";
import CreateAttributeModal from "./components/CreateAttributeModal";
import EditAttributeModal from "./components/EditAttributeModal";

const ATTRIBUTE_FILTER_FIELDS: FilterFieldDef[] = [
  { key: "search", label: "Attribute name", type: "text", placeholder: "Search..." },
  {
    key: "attributeType",
    label: "Type",
    type: "select",
    options: ATTRIBUTE_TYPES.map((type) => ({ value: type, label: humanize(type) })),
  },
];

function buildAttributeParameters(
  activeFilters: ActiveFilter[],
  pageNumber: number
): AttributeParameters {
  const params: AttributeParameters = { pageNumber, pageSize: 10 };

  for (const filter of activeFilters) {
    if (filter.key === "search") params.search = filter.value;
    if (filter.key === "attributeType") params.attributeType = filter.value;
  }

  return params;
}

export default function AttributesList() {
  const dispatch = useAppDispatch();
  const { attributes, loading, currentPage, totalPages, totalRecords, pageSize } =
    useAppSelector((state) => state.attributeMgmt);
  const canManage = useCan("attributes.manage");
  const { showFullLoader, showInlineLoader } = useListLoadingState(loading, attributes.length);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] =
    useState<AllAttributesResponse | null>(null);

  useEffect(() => {
    dispatch(getAttributes(buildAttributeParameters(activeFilters, pageNumber)));
  }, [dispatch, activeFilters, pageNumber]);

  function handleAddFilter(key: string, value: string) {
    setActiveFilters((prev) => [...prev.filter((filter) => filter.key !== key), { key, value }]);
    setPageNumber(1);
  }

  function handleRemoveFilter(key: string) {
    setActiveFilters((prev) => prev.filter((filter) => filter.key !== key));
    setPageNumber(1);
  }

  function handleClearAllFilters() {
    setActiveFilters([]);
    setPageNumber(1);
  }

  async function handleDelete(attribute: AllAttributesResponse) {
    if (
      !window.confirm(
        `Delete attribute "${attribute.attributeName}"? This cannot be undone.`
      )
    ) {
      return;
    }
    await dispatch(deleteAttribute(attribute.id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Attributes</h1>
          <p className="text-sm text-muted-foreground">
            Manage the attributes used to control file access
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:ring-4 hover:ring-primary/30"
            onClick={() => setCreateOpen(true)}
          >
            Create attribute
          </button>
        )}
      </div>

      <FilterBar
        fields={ATTRIBUTE_FILTER_FIELDS}
        activeFilters={activeFilters}
        onAdd={handleAddFilter}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {showFullLoader ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : attributes.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          No attributes found.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {showInlineLoader && (
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <Spinner size="sm" /> Updating...
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute) => (
                <tr key={attribute.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    <div>{humanize(attribute.attributeName)}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {attribute.attributeType}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {attribute.attributeType}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AttributeRowActions
                      attribute={attribute}
                      onEdit={setEditingAttribute}
                      onDelete={handleDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      )}

      {createOpen && (
        <CreateAttributeModal
          filters={buildAttributeParameters(activeFilters, pageNumber)}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editingAttribute && (
        <EditAttributeModal
          attribute={editingAttribute}
          filters={buildAttributeParameters(activeFilters, pageNumber)}
          onClose={() => setEditingAttribute(null)}
        />
      )}
    </div>
  );
}
