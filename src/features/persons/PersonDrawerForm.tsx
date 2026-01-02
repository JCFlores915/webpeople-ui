import { useEffect, useMemo } from "react";
import { Button, Drawer, Form, Input, Space, Switch, DatePicker, Typography, Spin, Grid, Row, Col } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CreatePersonRequest, Person, UpdatePersonRequest } from "../../utils/types/persons.types";

const { useBreakpoint } = Grid;

type Props = {
    open: boolean;
    busy: boolean;
    editing: Person | null;
    onClose: () => void;
    onCreate: (payload: CreatePersonRequest) => void;
    onUpdate: (id: string, payload: UpdatePersonRequest) => void;
};

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    birthDate?: Dayjs;
    documentNumber: string;
    isActive?: boolean;
};

export default function PersonDrawerForm({ open, busy, editing, onClose, onCreate, onUpdate }: Props) {
    const [form] = Form.useForm<FormValues>();
    const isEdit = !!editing;

    const screens = useBreakpoint();
    const isMobile = !screens.sm;

    const initialValues = useMemo<FormValues>(() => {
        return {
            firstName: editing?.firstName ?? "",
            lastName: editing?.lastName ?? "",
            email: editing?.email ?? "",
            phone: editing?.phone ?? "",
            birthDate: editing?.birthDate ? dayjs(editing.birthDate) : undefined,
            documentNumber: editing?.documentNumber ?? "",
            isActive: editing?.isActive ?? true,
        };
    }, [editing]);

    useEffect(() => {
        if (open) form.setFieldsValue(initialValues);
        else form.resetFields();
    }, [open, initialValues, form]);

    const submit = async () => {
        if (busy) return;

        try {
            const v = await form.validateFields();

            const payloadBase: CreatePersonRequest = {
                firstName: v.firstName.trim(),
                lastName: v.lastName.trim(),
                email: v.email.trim(),
                phone: v.phone?.trim() ? v.phone.trim() : null,
                birthDate: v.birthDate ? dayjs(v.birthDate).format("YYYY-MM-DD") : null,
                documentNumber: v.documentNumber.trim(),
            };

            if (!editing) onCreate(payloadBase);
            else onUpdate(editing.personId, { ...payloadBase, isActive: !!v.isActive });
        } catch {
            console.error("Validation failed");
        }
    };

    const buttonText = isEdit ? (busy ? "Updating..." : "Save changes") : busy ? "Creating..." : "Create";

    return (
        <Drawer
            title={isEdit ? "Edit person" : "Create person"}
            open={open}
            onClose={busy ? undefined : onClose}
            placement={isMobile ? "bottom" : "right"}
            width={isMobile ? "100%" : 480}
            height={isMobile ? "85vh" : undefined}
            destroyOnClose
            maskClosable={!busy}
            keyboard={!busy}
            styles={{
                body: { padding: isMobile ? 14 : 24 },
                footer: { padding: isMobile ? 14 : 16 },
            }}
            footer={
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Typography.Text type="secondary">{isEdit ? "Update existing record" : "Create a new record"}</Typography.Text>

                    <Space>
                        <Button onClick={onClose} disabled={busy}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={submit} loading={busy}>
                            {buttonText}
                        </Button>
                    </Space>
                </Space>
            }
        >
            <Spin spinning={busy} tip={isEdit ? "Updating person..." : "Creating person..."}>
                <Form form={form} layout="vertical" requiredMark="optional" initialValues={initialValues}>
                    <Row gutter={[12, 12]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="First name"
                                name="firstName"
                                rules={[
                                    { required: true, message: "First name is required" },
                                    { min: 2, message: "Min 2 characters" },
                                ]}
                            >
                                <Input placeholder="John" disabled={busy} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Last name"
                                name="lastName"
                                rules={[
                                    { required: true, message: "Last name is required" },
                                    { min: 2, message: "Min 2 characters" },
                                ]}
                            >
                                <Input placeholder="Doe" disabled={busy} />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Email is required" },
                                    { type: "email", message: "Invalid email format" },
                                ]}
                            >
                                <Input placeholder="john.doe@example.com" disabled={busy} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item label="Phone" name="phone">
                                <Input placeholder="+505..." disabled={busy} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item label="Birth date" name="birthDate">
                                <DatePicker style={{ width: "100%" }} disabled={busy} />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item
                                label="Document number"
                                name="documentNumber"
                                rules={[{ required: true, message: "Document number is required" }]}
                            >
                                <Input placeholder="ID-0001" disabled={busy} />
                            </Form.Item>
                        </Col>

                        {isEdit && (
                            <Col xs={24}>
                                <Form.Item label="Active" name="isActive" valuePropName="checked">
                                    <Switch disabled={busy} />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    );
}
