import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    App as AntApp,
    Button,
    Card,
    Flex,
    Input,
    Layout,
    Select,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography,
    Popconfirm,
    notification,
    Tooltip,
} from "antd";
import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import type { Person, CreatePersonRequest, UpdatePersonRequest } from "../../utils/types/persons.types";
import { getPersons, createPerson, updatePerson, deletePerson } from "../../api/persons.api";
import { getApiError } from "../../api/http";
import PersonDrawerForm from "./PersonDrawerForm";

const { Content } = Layout;

export default function PersonsPage() {
    const qc = useQueryClient();

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
        placeholderData: (prev) => prev, // UX: mantiene la tabla mientras pagina/busca
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
    const columns: ColumnsType<Person> = [
        {
            title: "Name",
            key: "name",
            render: (_value: unknown, p: Person) => (
                <Typography.Text strong>
                    {p.firstName} {p.lastName}
                </Typography.Text>
            ),
        },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            render: (v: string | null | undefined) =>
                v?.trim() ? (
                    <Typography.Text>{v}</Typography.Text>
                ) : (
                    <Tooltip title="No phone available">
                        <Tag icon={<WarningOutlined />} color="warning">
                            No phone
                        </Tag>
                    </Tooltip>
                ),
        },
        { title: "Document", dataIndex: "documentNumber", key: "documentNumber" },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (v: boolean) =>
                v ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 220,
            render: (_: unknown, p: Person) => {
                if (!p.isActive) return null;
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
                            okButtonProps={{ danger: true, loading: deleteM.isPending }}
                            onConfirm={() => deleteM.mutate(p.personId)}
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

    return (
        <AntApp>
            <Layout style={{ minHeight: "100vh", background: "#fafafa" }}>
                <Content style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                    <div style={{ width: "100%", maxWidth: 1100 }}>
                        <Card style={{ borderRadius: 16 }}>
                            <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
                                <div>
                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                        People Catalog
                                    </Typography.Title>
                                </div>

                                <Space>
                                    <Button
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
                                </Space>
                            </Flex>

                            <div style={{ marginTop: 16 }}>
                                <Flex gap={12} wrap="wrap">
                                    <Input
                                        placeholder="Search (name, email, document)..."
                                        value={search}
                                        onChange={(e) => {
                                            setPage(1);
                                            setSearch(e.target.value);
                                        }}
                                        style={{ flex: 1, minWidth: 280 }}
                                        allowClear
                                    />

                                    <Select
                                        value={isActive === null ? "all" : isActive ? "active" : "inactive"}
                                        onChange={(v) => {
                                            setPage(1);
                                            setIsActive(v === "all" ? null : v === "active");
                                        }}
                                        style={{ width: 160 }}
                                        options={[
                                            { value: "active", label: "Active" },
                                            { value: "inactive", label: "Inactive" },
                                            { value: "all", label: "All" },
                                        ]}
                                    />
                                </Flex>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                {personsQ.isLoading ? (
                                    <Skeleton active paragraph={{ rows: 6 }} />
                                ) : personsQ.isError ? (
                                    <div style={{ padding: 12 }}>
                                        <Typography.Text type="danger">
                                            {getApiError(personsQ.error).message}
                                        </Typography.Text>
                                    </div>
                                ) : (
                                    <Table
                                        rowKey="personId"
                                        columns={columns}
                                        dataSource={items}
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
