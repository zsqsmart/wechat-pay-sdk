import { useRequest } from 'alova';
import {
  NDataTable,
  type DataTableColumns,
  NImage,
  NSpace,
  NButton,
  NPopconfirm,
} from 'naive-ui';
import { WechatTradeStateEnum } from 'wx-node-sdk';
import { reqCloseOrder, reqOrderList } from 'src/apis/order';
import PayQrCode from 'src/components/pay-qr-code';
import { ORDER_STATUS_DIC } from 'src/constants';
import type { OrderWithProduct } from 'src/typings';
import { defineComponent, ref } from 'vue';

const OrderPage = defineComponent({
  setup() {
    const currentOrder = ref<OrderWithProduct>();
    const {
      data: orderList,
      loading,
      send: getOrderList,
    } = useRequest(reqOrderList, {
      initialData: [],
    });
    const closeOrderRequest = useRequest(reqCloseOrder, {
      immediate: false,
    });
    closeOrderRequest.onSuccess(() => {
      getOrderList();
    });
    const columns: DataTableColumns<OrderWithProduct> = [
      {
        title: '订单编号',
        key: 'id',
      },
      {
        title: '商品名称',
        key: 'product.name',
        render: (row: OrderWithProduct) => row.product.name,
      },
      {
        title: '商品图片',
        key: 'product.cover',
        render: (row: OrderWithProduct) => (
          <NImage lazy src={row.product.cover} width="200" />
        ),
      },
      {
        title: '商品价格',
        key: 'product.price',
        render: (row: OrderWithProduct) => row.product.price,
      },
      {
        title: '状态',
        key: 'status',
        render: (row: OrderWithProduct) => ORDER_STATUS_DIC[row.status || ''],
      },
      {
        title: '操作',
        key: 'action',
        render: (row: OrderWithProduct) => (
          <NSpace>
            <NButton>详情</NButton>
            {row.status === WechatTradeStateEnum.NOT_PAY && (
              <NButton
                type="primary"
                onClick={() => {
                  currentOrder.value = row;
                }}
              >
                支付
              </NButton>
            )}
            {row.status === WechatTradeStateEnum.NOT_PAY && (
              <NPopconfirm
                onPositiveClick={() => {
                  if (closeOrderRequest.loading.value) return;
                  closeOrderRequest.send(row.id);
                }}
                v-slots={{
                  trigger: () => <NButton type="error">关闭订单</NButton>,
                }}
              >
                是否确认关闭订单
              </NPopconfirm>
            )}
          </NSpace>
        ),
      },
    ];

    return () => (
      <div>
        <NDataTable
          loading={loading.value}
          columns={columns}
          data={orderList.value}
          bordered={false}
        />
        <PayQrCode
          show={!!currentOrder.value}
          onHide={() => (currentOrder.value = null)}
          orderId={currentOrder.value?.id}
          codeUrl={currentOrder.value?.codeUrl}
        />
      </div>
    );
  },
});

export default OrderPage;
