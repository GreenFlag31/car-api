import { User } from '../model/user.js';

async function updateCounterAndDateStatus(user, login = false) {
  const dateInDataBase = user.queries.dateNow;
  let addingOneMonthTodateInDataBase = dateInDataBase.setMonth(dateInDataBase.getMonth() + 1);

  const currentDateOfQuery = Date.now();

  if (currentDateOfQuery < addingOneMonthTodateInDataBase) {
    // In the interval of time of one month and queries left
    try {
      await User.updateOne({ _id: user._id }, { $inc: { 'queries.counter': 1 } });
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    while (currentDateOfQuery >= addingOneMonthTodateInDataBase) {
      addingOneMonthTodateInDataBase = dateInDataBase.setMonth(dateInDataBase.getMonth() + 1);
    }

    const dateToIsoString = new Date(
      dateInDataBase.setMonth(dateInDataBase.getMonth() - 1)
    ).toISOString();
    console.log(dateToIsoString);

    await User.updateOne(
      { _id: user._id },
      { $set: { 'queries.dateNow': dateToIsoString, 'queries.counter': login ? 0 : 1 } }
    );
  }
}

export { updateCounterAndDateStatus };
