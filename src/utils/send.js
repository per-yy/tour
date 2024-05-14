// import { isValidEmail } from "./isValidEmail";
// import { sendService } from "@/api/user";

// export const send = async () => {
//     if (!isValidEmail(userData.value.email)) {
//         ElMessage.error("请检查邮箱是否填写正确")
//     } else {
//         const result = await sendService(userData.value.email);
//         if (result.code === 0) {
//             //验证码发送成功
//             ElMessage.success("发送成功")
//             verificationCode = result.data;
//             disableButton();//禁用按钮
//         } else {
//             //发送失败
//             ElMessage.error("服务异常")
//         }
//     }
// }
