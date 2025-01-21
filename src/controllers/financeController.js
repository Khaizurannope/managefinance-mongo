const Finance = require('../models/financeModel');

const getFinances = async (req, res) => {
  try {
    const { type, month, year, report } = req.query;
    const userId = req.user.id;

    let query = { user: userId };

    if (type) {
      query.type = type;
    }

    if (month || year) {
      const monthInt = parseInt(month) || 1;
      const yearInt = parseInt(year) || new Date().getFullYear();

      query.createdAt = {
        $gte: new Date(yearInt, monthInt - 1, 1),
        $lt: new Date(yearInt, monthInt, 1),
      };
    }

    const finances = await Finance.find(query);

    if (report) {
      const totalIncome = finances
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      const totalExpense = finances
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

      const balance = totalIncome - totalExpense;

      return res.status(200).json({
        totalIncome,
        totalExpense,
        balance,
      });
    }

    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const createFinance = async (req, res) => {
  const { title, amount, type } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
    });

    res.status(201).json(finance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data finance' });
  }
};

const updateFinance = async (req, res) => {
  const { id } = req.params;

  try {
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const updatedFinance = await Finance.findByIdAndUpdate(
      id,
      req.body,
      { new: true } 
    );

    res.status(200).json(updatedFinance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate data finance' });
  }
};

const deleteFinance = async (req, res) => {
  const { id } = req.params;

  try {
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    await finance.deleteOne();
    res.status(200).json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data finance' });
  }
};

module.exports = { getFinances, createFinance, updateFinance, deleteFinance };