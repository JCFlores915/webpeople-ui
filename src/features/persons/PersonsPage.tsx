import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    App as AntApp,
    Button,
    Card,
    Grid,
    Input,
    Layout,
    Row,
    Col,
    Select,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography,
    Popconfirm,
    notification,
    Tooltip,
    Divider,
} from "antd";
import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import type { Person, CreatePersonRequest, UpdatePersonRequest } from "../../utils/types/persons.types";
import { getPersons, createPerson, updatePerson, deletePerson } from "../../api/persons.api";
import { getApiError } from "../../api/http";
import PersonDrawerForm from "./PersonDrawerForm";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function PersonsPage() {
    const qc = useQueryClient();
    const screens = useBreakpoint();
    const isMobile = !screens.sm;

    // Query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [isActive, setIsActive] = useState<boolean | null>(true);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<Person | null>(null);

    const queryKey = useMemo(
        () => ["persons", { page, pageSize, search, isActive }],
        [page, pageSize, search, isActive]
    );

    const personsQ = useQuery({
        queryKey,
        queryFn: () => getPersons({ page, pageSize, search, isActive }),
        placeholderData: (prev) => prev,
    });

    // MUTATIONS
    const createM = useMutation({
        mutationFn: (payload: CreatePersonRequest) => createPerson(payload),
        onSuccess: async () => {
            notification.success({ message: "Person created" });
            setDrawerOpen(false);
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            notification.error({ message: "Create failed", description: e.message });
        },
    });

    const updateM = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePersonRequest }) =>
            updatePerson(id, payload),
        onSuccess: async () => {
            notification.success({ message: "Person updated" });
            setDrawerOpen(false);
            setEditing(null);
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            notification.error({ message: "Update failed", description: e.message });
        },
    });

    const deleteM = useMutation({
        mutationFn: (id: string) => deletePerson(id),
        onSuccess: async () => {
            notification.success({ message: "Person deleted" });
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            notification.error({ message: "Delete failed", description: e.message });
        },
    });

    const busy = personsQ.isFetching || createM.isPending || updateM.isPending || deleteM.isPending;

    const data = personsQ.data;
    const items = data?.items ?? [];

    const deleteIsPending = deleteM.isPending;
    const deleteMutate = deleteM.mutate;

    const columns: ColumnsType<Person> = useMemo(() => {
        const phoneBadge = (v: string | null | undefined) =>
            v?.trim() ? (
                <Typography.Text>{v}</Typography.Text>
            ) : (
                <Tooltip title="No phone available">
                    <Tag icon={<WarningOutlined />} color="warning" style={{ marginInlineEnd: 0 }}>
                        No phone
                    </Tag>
                </Tooltip>
            );

        return [
            {
                title: "Name",
                key: "name",
                render: (_value: unknown, p: Person) => (
                    <div style={{ minWidth: 220 }}>
                        <Typography.Text strong>
                            {p.firstName} {p.lastName}
                        </Typography.Text>

                        {isMobile && (
                            <>
                                <div style={{ marginTop: 6 }}>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        {p.email}
                                    </Typography.Text>
                                </div>

                                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {phoneBadge(p.phone)}
                                    <Tag style={{ marginInlineEnd: 0 }}>{p.documentNumber}</Tag>
                                    {p.isActive ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>}
                                </div>

                                {/* Acciones solo si está activo (móvil) */}
                                {p.isActive && (
                                    <>
                                        <Divider style={{ margin: "12px 0" }} />
                                        <Space>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setEditing(p);
                                                    setDrawerOpen(true);
                                                }}
                                                disabled={busy}
                                            >
                                                Edit
                                            </Button>

                                            <Popconfirm
                                                title="Delete person?"
                                                description="This action will mark the person as inactive (soft delete)."
                                                okText="Delete"
                                                okButtonProps={{ danger: true, loading: deleteIsPending }}
                                                onConfirm={() => deleteMutate(p.personId)}
                                                disabled={busy}
                                            >
                                                <Button size="small" danger disabled={busy}>
                                                    Delete
                                                </Button>
                                            </Popconfirm>
                                        </Space>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ),
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                responsive: ["sm"],
            },
            {
                title: "Phone",
                dataIndex: "phone",
                key: "phone",
                responsive: ["sm"],
                render: (v: string | null | undefined) => phoneBadge(v),
            },
            {
                title: "Document",
                dataIndex: "documentNumber",
                key: "documentNumber",
                responsive: ["sm"],
            },
            {
                title: "Status",
                dataIndex: "isActive",
                key: "isActive",
                responsive: ["sm"],
                render: (v: boolean) => (v ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>),
            },
            {
                title: "Actions",
                key: "actions",
                width: 220,
                responsive: ["sm"],
                render: (_: unknown, p: Person) => {
                    if (!p.isActive) return <Typography.Text type="secondary">—</Typography.Text>;

                    return (
                        <Space>
                            <Button
                                size="small"
                                onClick={() => {
                                    setEditing(p);
                                    setDrawerOpen(true);
                                }}
                                disabled={busy}
                            >
                                Edit
                            </Button>

                            <Popconfirm
                                title="Delete person?"
                                description="This action will mark the person as inactive (soft delete)."
                                okText="Delete"
                                okButtonProps={{ danger: true, loading: deleteIsPending }}
                                onConfirm={() => deleteMutate(p.personId)}
                                disabled={busy}
                            >
                                <Button size="small" danger disabled={busy}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                    );
                },
            },
        ];
    }, [isMobile, busy, deleteIsPending, deleteMutate]);

    return (
        <AntApp>
            <Layout style={{ minHeight: "100vh", background: "#f6f7fb" }}>
                <Content style={{ display: "flex", justifyContent: "center", padding: isMobile ? 12 : 24 }}>
                    <div style={{ width: "100%", maxWidth: 1100 }}>
                        <Card
                            style={{ borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}
                            bodyStyle={{ padding: isMobile ? 14 : 24 }}
                        >
                            {/* Header */}
                            <Row gutter={[12, 12]} align="middle" justify="space-between">
                                <Col xs={24} sm={16}>
                                    <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                                        People Catalog
                                    </Typography.Title>
                                    <Typography.Text type="secondary">
                                        Manage people records with search, pagination and status.
                                    </Typography.Text>
                                </Col>

                                <Col xs={24} sm={8} style={{ display: "flex", justifyContent: isMobile ? "stretch" : "flex-end" }}>
                                    <Button
                                        block={isMobile}
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditing(null);
                                            setDrawerOpen(true);
                                        }}
                                        disabled={busy}
                                    >
                                        New person
                                    </Button>
                                </Col>
                            </Row>

                            {/* Filters */}
                            <div style={{ marginTop: 16 }}>
                                <Row gutter={[12, 12]}>
                                    <Col xs={24} sm={16}>
                                        <Input
                                            placeholder="Search (name, email, document)..."
                                            value={search}
                                            onChange={(e) => {
                                                setPage(1);
                                                setSearch(e.target.value);
                                            }}
                                            allowClear
                                            size={isMobile ? "middle" : "large"}
                                        />
                                    </Col>

                                    <Col xs={24} sm={8}>
                                        <Select
                                            value={isActive === null ? "all" : isActive ? "active" : "inactive"}
                                            onChange={(v) => {
                                                setPage(1);
                                                setIsActive(v === "all" ? null : v === "active");
                                            }}
                                            style={{ width: "100%" }}
                                            size={isMobile ? "middle" : "large"}
                                            options={[
                                                { value: "active", label: "Active" },
                                                { value: "inactive", label: "Inactive" },
                                                { value: "all", label: "All" },
                                            ]}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            {/* Table */}
                            <div style={{ marginTop: 16 }}>
                                {personsQ.isLoading ? (
                                    <Skeleton active paragraph={{ rows: 6 }} />
                                ) : personsQ.isError ? (
                                    <div style={{ padding: 12 }}>
                                        <Typography.Text type="danger">{getApiError(personsQ.error).message}</Typography.Text>
                                    </div>
                                ) : (
                                    <Table
                                        rowKey="personId"
                                        columns={columns}
                                        dataSource={items}
                                        size={isMobile ? "small" : "middle"}
                                        scroll={{ x: "max-content" }} // ✅ mobile safe
                                        pagination={{
                                            current: data?.page ?? 1,
                                            pageSize: data?.pageSize ?? pageSize,
                                            total: Number(data?.totalItems ?? 0),
                                            showSizeChanger: true,
                                            pageSizeOptions: [5, 10, 20, 50, 100],
                                            onChange: (p, ps) => {
                                                setPage(p);
                                                setPageSize(ps);
                                            },
                                        }}
                                        loading={busy && !personsQ.isLoading}
                                    />
                                )}
                            </div>
                        </Card>

                        <PersonDrawerForm
                            open={drawerOpen}
                            busy={createM.isPending || updateM.isPending}
                            editing={editing}
                            onClose={() => {
                                setDrawerOpen(false);
                                setEditing(null);
                            }}
                            onCreate={(payload) => createM.mutate(payload)}
                            onUpdate={(id, payload) => updateM.mutate({ id, payload })}
                        />
                    </div>
                </Content>
            </Layout>
        </AntApp>
    );
}
