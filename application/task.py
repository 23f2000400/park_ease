import csv
from celery import shared_task
from .models import *
import datetime
from .utils import format_report
from .mail import send_email
# from .mail import send_email, format_report

@shared_task(ignore_results=False, name='download_csv_report')
def csv_report():
    reservations = Reservation.query.all()
    csv_file_name = f"reservations_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(f'static/{csv_file_name}', 'w', newline='') as csvfile:
        sr_no = 1
        fieldnames = ['Sr No', 'Reservation ID', 'User ID', 'Spot ID', 'Vehicle No', 'Cost', 'Check-in', 'Check-out', 'Status']
        res_csv = csv.writer(csvfile, delimiter=',')
        res_csv.writerow(fieldnames)
        for reservation in reservations:
            this_res = [
                sr_no,
                reservation.id,
                reservation.user_id,
                reservation.spot_id,
                reservation.vehicle_number,
                float(reservation.cost or 0),
                reservation.check_in.strftime('%Y-%m-%d %H:%M:%S') if reservation.check_in else '',
                reservation.check_out.strftime('%Y-%m-%d %H:%M:%S') if reservation.check_out else '',
                reservation.status
            ]
            res_csv.writerow(this_res)
            sr_no += 1
    return csv_file_name


@shared_task(ignore_results=False, name='monthly_report')
def monthly_report():
    now = datetime.datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    users = User.query.all()
    for user in users:
        user_booking = []
        total_duration = 0

        reservations = Reservation.query.filter(
            Reservation.user_id == user.id,
            Reservation.status == 'completed',
            Reservation.check_out >= month_start
        ).all()

        for res in reservations:
            if res.check_in and res.check_out:
                duration = (res.check_out - res.check_in).total_seconds()
                total_duration += duration

            user_booking.append({
                'id': res.id,
                'spot_id': res.spot_id,
                'vehicle_number': res.vehicle_number,
                'cost': float(res.cost or 0),
                'check_in': res.check_in.strftime('%Y-%m-%d %H:%M:%S'),
                'check_out': res.check_out.strftime('%Y-%m-%d %H:%M:%S') if res.check_out else '',
                'status': res.status
            })

        if user_booking:
            avg_seconds = total_duration / len(user_booking) if len(user_booking) > 0 else 0
            hours = int(avg_seconds // 3600)
            minutes = int((avg_seconds % 3600) // 60)
            avg_duration = f"{hours}h {minutes}m"

            message = format_report('templates/mail_details.html', {
                'username': user.username,
                'email': user.email,
                'user_booking': user_booking,
                'now': now,
                'avg_duration': avg_duration
            })
            send_email(user.email, subject='Monthly Reservation Report - Park Ease', message=message)

    return "Monthly report sent."




@shared_task(ignore_results=False, name='daily_report')
def daily_report():
    # Placeholder: implement logic as needed
    return "Daily report generated."
