const { conn } = require("./config");
const axios = require("axios");

module.exports = {
  getEmailByInvoiceValue: (invoiceValue) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT u.id AS user_id, u.email, o.type 
      FROM orders o 
      INNER JOIN users u ON u.id = o.user_id
      WHERE invoice_value = ?`;

      const values = [invoiceValue];

      conn.query(query, values, (e, result) => {
        if (e) {
          reject(new Error(e));
        } else {
          resolve(result);
        }
      });
    });
  },

  updatePaymentPaid: (orderId) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE orders SET status = 2 WHERE invoice_value = ?`;

      conn.query(query, [orderId], (e, result) => {
        if (e) {
          reject(new Error(e));
        } else {
          resolve(result);
        }
      });
    });
  },

  sendEmail: async (app, subject, email, body, type) => {
    try {
      const response = await axios.post(
        "https://api-email.inovatiftujuh8.com/api/v1/email",
        {
          to: email,
          app: app,
          subject: subject,
          body: body,
          type: type,
        }
      );
      if (response.status == 200) {
        console.log("Send E-mail Success");
      }
    } catch (e) {
      console.log(e);
    }
  },
};
