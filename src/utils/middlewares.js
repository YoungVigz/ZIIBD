const checkDate = (req, res, next) => {
    const { start_date, end_date } = req.body

    if (!start_date || !end_date) {
        return res.status(400).render('error', {
            message: "Data początkowa i końcowa są wymagane!",
            code: 400
        })
    }

    const start = new Date(start_date)
    const end = new Date(end_date)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).render('error', {
            message: "Nieprawidłowy format daty!",
            code: 400
        })
    }

    if (end < start) {
        return res.status(400).render('error', {
            message: "Data końcowa nie może być wcześniejsza niż data początkowa!",
            code: 400
        })
    }

    next()
}

module.exports = { checkDate }